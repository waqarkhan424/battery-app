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

    // holds the URL of the video to preview
    private var appliedVideoUrl: String? = null

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == BatteryManager.BATTERY_STATUS_FULL

            // only deep-link if we actually have a non-empty URL
            if (isCharging && !appliedVideoUrl.isNullOrBlank()) {
                val launch = Intent(context, MainActivity::class.java).apply {
                    action = Intent.ACTION_VIEW
                    // EDIT #2 — use a single route: /charging/[videoUrl]
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
        registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // EDIT #1 — do NOT overwrite a good URL with an empty one
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

        // channel for API 26+
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

        // EDIT #2 (also in notification) — deep-link to the same /charging route
        val contentIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            val targetUrl = appliedVideoUrl ?: ""
            data = Uri.parse("batteryapp://charging/${Uri.encode(targetUrl)}")
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
            // full-screen intent is optional; leaving it out avoids surprise popups
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
    }
}
