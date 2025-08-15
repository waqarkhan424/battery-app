package com.anonymous.batteryapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import androidx.core.app.NotificationCompat

class ChargingAnimationService : Service() {

    // Persisted across process restarts
    private var appliedVideoUrl: String? = null

    // Debounce so we don't spam-launch the Activity after cold kill
    private var lastLaunchMs: Long = 0L
    private val launchCooldownMs = 2500L

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.action
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val isChargingNow =
                (action == Intent.ACTION_POWER_CONNECTED) ||
                status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL

            if (!isChargingNow || appliedVideoUrl.isNullOrBlank()) return

            // Debounce multiple broadcasts
            val now = SystemClock.elapsedRealtime()
            if (now - lastLaunchMs < launchCooldownMs) return
            lastLaunchMs = now

            //  Launch lightweight native PlayerActivity instead of deep-linking into RN
            val launch = Intent(context, PlayerActivity::class.java).apply {
                putExtra("videoUrl", appliedVideoUrl!!)
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }

            // Short wake lock + slight delay to let device wake the screen
            val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            @Suppress("WakelockTimeout")
            val wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "batteryapp:chargeWake")
            try {
                wl.acquire(5_000) // safety timeout
            } catch (_: Throwable) { /* no-op */ }

            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    context.startActivity(launch)
                } finally {
                    try { if (wl.isHeld) wl.release() } catch (_: Throwable) {}
                }
            }, 450) // small debounce helps reliability on cold/wake cases
        }
    }

    override fun onCreate() {
        super.onCreate()

        // Restore last applied URL so we still work after process death
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        appliedVideoUrl = prefs.getString(KEY_APPLIED_URL, null)

        // Listen for plug/unplug + battery status
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(Intent.ACTION_POWER_DISCONNECTED)
            addAction(Intent.ACTION_BATTERY_CHANGED)
        }
        registerReceiver(batteryReceiver, filter)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Update URL if a fresh one is provided, and persist it
        intent?.getStringExtra("videoUrl")?.trim()?.takeIf { it.isNotBlank() }?.let { url ->
            appliedVideoUrl = url
            getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_APPLIED_URL, url)
                .apply()
        }

        startForeground(NOTIFICATION_ID, buildNotification())
        return START_STICKY
    }

    override fun onDestroy() {
        unregisterReceiver(batteryReceiver)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(): Notification {
        val channelId = "charging_animation_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val mgr = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (mgr.getNotificationChannel(channelId) == null) {
                val ch = NotificationChannel(
                    channelId,
                    "Charging Animation",
                    NotificationManager.IMPORTANCE_LOW
                ).apply { description = "Keeps the charging animation service running" }
                mgr.createNotificationChannel(ch)
            }
        }

        //  Tap notification → open tiny native player (not RN)
        val contentIntent = if (!appliedVideoUrl.isNullOrBlank()) {
            Intent(this, PlayerActivity::class.java).apply {
                putExtra("videoUrl", appliedVideoUrl!!)
            }
        } else {
            Intent(this, MainActivity::class.java).apply {
                action = Intent.ACTION_MAIN
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
        }

        val piFlags =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            else
                PendingIntent.FLAG_UPDATE_CURRENT

        val pendingIntent = PendingIntent.getActivity(this, 0, contentIntent, piFlags)

        return NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Charging animation enabled")
            .setContentText("Will auto-play when you plug in your phone")
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val PREFS_NAME = "charging_prefs"
        private const val KEY_APPLIED_URL = "appliedVideoUrl"
    }
}
