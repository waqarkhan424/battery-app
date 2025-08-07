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

    
    // only deep-link into /video-player if we've actually got a non-empty URL
    if (isCharging && !appliedVideoUrl.isNullOrBlank()) {
        val launch = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("batteryapp://video-player/${Uri.encode(appliedVideoUrl!!)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(launch)
        
            } else {
                // TODO: hide any native overlay if you add one here
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        // Register the battery receiver
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        registerReceiver(batteryReceiver, filter)

        // Start in foreground with a full-screen intent notification
        startForeground(NOTIFICATION_ID, buildNotification())
    }

    override fun onDestroy() {
        unregisterReceiver(batteryReceiver)
        super.onDestroy()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Grab the videoUrl extra from JS and save it
        appliedVideoUrl = intent?.getStringExtra("videoUrl")
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(): Notification {
        val channelId = "charging_animation_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Charging Animation Service",
                NotificationManager.IMPORTANCE_LOW
            )
            channel.setShowBadge(false)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        // Intent for full-screen launch
        val intent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("batteryapp://video-player/${Uri.encode(appliedVideoUrl)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Battery App")
            .setContentText("Charging animation is running – go to settings to stop")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)              // heads-up
            .setCategory(NotificationCompat.CATEGORY_CALL)             // urgent
            .setFullScreenIntent(fullScreenPendingIntent, true)        // full-screen when locked
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
    }
}
