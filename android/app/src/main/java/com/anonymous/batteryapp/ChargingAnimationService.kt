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

    // Holds the URL of the applied/selected video
    private var appliedVideoUrl: String? = null

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // Treat ACTION_POWER_CONNECTED as "charging" immediately.
            val action = intent.action
            val chargingByAction = action == Intent.ACTION_POWER_CONNECTED

            // Also check battery status when ACTION_BATTERY_CHANGED fires.
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val chargingByStatus =
                status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL

            val isCharging = chargingByAction || chargingByStatus

            // Only deep-link if we actually have a non-empty URL
            if (isCharging && !appliedVideoUrl.isNullOrBlank()) {
                val launch = Intent(context, MainActivity::class.java).apply {
                    action = Intent.ACTION_VIEW
                    // Use a single route for charging playback
                    data = Uri.parse("batteryapp://charging/${Uri.encode(appliedVideoUrl!!)}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                context.startActivity(launch)
            } else {
                // no-op (or hide any native overlay here if you add one)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        // Listen to both BATTERY_CHANGED and POWER_CONNECTED/DISCONNECTED
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_BATTERY_CHANGED)      // status/level updates
            addAction(Intent.ACTION_POWER_CONNECTED)      // fires immediately on plug
            addAction(Intent.ACTION_POWER_DISCONNECTED)   // optional: react on unplug if needed
        }
        registerReceiver(batteryReceiver, filter)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Do NOT overwrite a good URL with an empty one
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

        // Channel for API 26+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val mgr = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (mgr.getNotificationChannel(channelId) == null) {
                mgr.createNotificationChannel(
                    NotificationChannel(
                        channelId,
                        "Charging Animation",
                        NotificationManager.IMPORTANCE_LOW
                    ).apply { description = "Keeps the charging animation service running" }
                )
            }
        }

        // Safer tap behavior:
        // If we have a URL, deep link to /charging/[videoUrl]; otherwise open app home.
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

        val piFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        else PendingIntent.FLAG_UPDATE_CURRENT
        val pendingIntent = PendingIntent.getActivity(this, 0, contentIntent, piFlags)

        return NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Charging animation enabled")
            .setContentText("Will auto-play when you plug in your phone")
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            // No full-screen intent to avoid surprise popups
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
    }
}
