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

    private var appliedVideoUrl: String? = null

    // existing cooldown (kept)
    private var lastLaunchMs: Long = 0L
    private val launchCooldownMs = 2500L

    // one-launch-per-plug session latch
    private var playedThisCharge = false
    private var wasCharging = false

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.action
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val isChargingNow =
                status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL

            when (action) {
                Intent.ACTION_POWER_DISCONNECTED -> {
                    // Cable removed: next plug-in may play again
                    wasCharging = false
                    playedThisCharge = false
                    return
                }

                Intent.ACTION_BATTERY_CHANGED -> {
                    // Update state only; do NOT launch from generic battery ticks
                    wasCharging = isChargingNow
                    return
                }

                Intent.ACTION_POWER_CONNECTED -> {
                    // explicit new plug-in event
                    wasCharging = true
                }

                else -> {
                    // Ignore other actions
                    return
                }
            }

            // From here, we are handling ACTION_POWER_CONNECTED only.
            if (appliedVideoUrl.isNullOrBlank()) return
            if (playedThisCharge) return

            val now = SystemClock.elapsedRealtime()
            if (now - lastLaunchMs < launchCooldownMs) return
            lastLaunchMs = now

            val launch = Intent(context, PlayerActivity::class.java).apply {
                putExtra("videoUrl", appliedVideoUrl!!)
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }

            val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            @Suppress("WakelockTimeout")
            val wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "batteryapp:chargeWake")

            try { wl.acquire(5_000) } catch (_: Throwable) {}

            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    context.startActivity(launch)
                    // mark as shown for this plug-in session
                    playedThisCharge = true
                } finally {
                    try { if (wl.isHeld) wl.release() } catch (_: Throwable) {}
                }
            }, 450)
        }
    }

    override fun onCreate() {
        super.onCreate()
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        appliedVideoUrl = prefs.getString(KEY_APPLIED_URL, null)

        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(Intent.ACTION_POWER_DISCONNECTED)
            addAction(Intent.ACTION_BATTERY_CHANGED)
        }
        registerReceiver(batteryReceiver, filter)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
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

        // Always open the app's home/Library screen when tapping the notification  <<< CHANGED
        val contentIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
            addCategory(Intent.CATEGORY_LAUNCHER)
            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            )
        }

        val piFlags =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            else
                PendingIntent.FLAG_UPDATE_CURRENT

        val pendingIntent = PendingIntent.getActivity(this, 0, contentIntent, piFlags)

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Charging animation enabled")            // <<< CHANGED
            .setContentText("Go to app settings to stop the service") // <<< CHANGED
            .setOngoing(true)
            .setContentIntent(pendingIntent) // tap → Library/home
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val PREFS_NAME = "charging_prefs"
        const val KEY_APPLIED_URL = "appliedVideoUrl"
        const val KEY_DURATION_MS = "durationMs"
        const val KEY_CLOSE_METHOD = "closeMethod"
    }
}
