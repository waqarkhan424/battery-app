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
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class ChargingAnimationService : Service() {

    // MUST be 'var' (we update it in onStartCommand)
    private var appliedVideoUrl: String? = null

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.action
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

            // Compute once, no reassignment (avoids "val cannot be reassigned")
            val isChargingNow =
                (action == Intent.ACTION_POWER_CONNECTED) ||
                status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL

            if (isChargingNow && !appliedVideoUrl.isNullOrBlank()) {
                val launch = Intent(context, MainActivity::class.java).apply {
                    this.action = Intent.ACTION_VIEW
                    data = Uri.parse("batteryapp://charging/${Uri.encode(appliedVideoUrl!!)}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                context.startActivity(launch)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        // Listen for fast plug event + battery status changes
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_POWER_CONNECTED)
            addAction(Intent.ACTION_POWER_DISCONNECTED)
            addAction(Intent.ACTION_BATTERY_CHANGED)
        }
        registerReceiver(batteryReceiver, filter)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Update URL only if a non-blank value is provided
        val maybeUrl = intent?.getStringExtra("videoUrl")?.trim()
        if (!maybeUrl.isNullOrBlank()) {
            appliedVideoUrl = maybeUrl
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

        // If we have a URL, deep-link to /charging; else open app home
        val contentIntent = if (!appliedVideoUrl.isNullOrBlank()) {
            Intent(this, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse("batteryapp://charging/${Uri.encode(appliedVideoUrl!!)}")
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
    }
}
