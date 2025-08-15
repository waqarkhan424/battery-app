package com.anonymous.batteryapp

import android.content.BroadcastReceiver
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity
import java.text.DateFormat
import java.util.Date
import java.util.Locale

/**
 * Lightweight fullscreen player used only for plug-in events.
 * - Runs before RN/JS is warm
 * - Loops the saved MP4
 * - Shows over lockscreen and turns screen on
 * - NOW: draws time + battery overlay on top of the video
 */
class PlayerActivity : AppCompatActivity() {

    private lateinit var videoView: VideoView
    private lateinit var timeText: TextView
    private lateinit var batteryPctText: TextView
    private lateinit var batteryIconText: TextView

    private val timeHandler = Handler(Looper.getMainLooper())
    private val timeTick = object : Runnable {
        override fun run() {
            updateTime()
            // update once per second so lockscreen clock feels live
            timeHandler.postDelayed(this, 1000)
        }
    }

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: android.content.Context, intent: Intent) {
            val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100).coerceAtLeast(1)
            val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            val pct = if (level >= 0) (level * 100 / scale) else -1

            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                             status == BatteryManager.BATTERY_STATUS_FULL

            batteryIconText.text = if (isCharging) "⚡" else "🔋"
            batteryPctText.text = if (pct >= 0) "$pct%" else ""
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // make visible when device is locked; turn screen on
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        super.onCreate(savedInstanceState)

        // Root container
        val container = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }

        // Video view (full screen, behind overlays)
        videoView = VideoView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }
        container.addView(videoView)

        // ======= Overlays =======

        // Top time text
        timeText = TextView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP or Gravity.CENTER_HORIZONTAL
            ).apply {
                topMargin = dp(18)
            }
            textSize = 22f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
            text = "" // filled by updateTime()
        }
        container.addView(timeText)

        // Bottom battery cluster (⚡ inside a circle + percentage below)
        val bottomCluster = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            ).apply {
                bottomMargin = dp(24)
            }
            gravity = Gravity.CENTER_HORIZONTAL
        }

        val circleBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(999).toFloat()
            setColor(Color.parseColor("#1F1F1F")) // translucent dark
        }

        batteryIconText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(dp(56), dp(56))
            background = circleBg
            gravity = Gravity.CENTER
            textSize = 24f
            setTextColor(Color.WHITE)
            text = "⚡"
        }

        batteryPctText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(10)
            }
            gravity = Gravity.CENTER
            textSize = 18f
            setTextColor(Color.WHITE)
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
            text = "" // filled by battery receiver
        }

        bottomCluster.addView(batteryIconText)
        bottomCluster.addView(batteryPctText)
        container.addView(bottomCluster)

        setContentView(container)

        // Start playback
        playFromIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { playFromIntent(it) }
    }

    override fun onResume() {
        super.onResume()
        // start clock updates
        timeHandler.post(timeTick)

        // listen for battery updates (ACTION_BATTERY_CHANGED is sticky)
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val sticky = registerReceiver(batteryReceiver, filter)
        // prime initial value if sticky intent was returned
        if (sticky != null) batteryReceiver.onReceive(this, sticky)
    }

    override fun onPause() {
        super.onPause()
        timeHandler.removeCallbacks(timeTick)
        try {
            unregisterReceiver(batteryReceiver)
        } catch (_: Throwable) {}
    }

    private fun playFromIntent(intent: Intent) {
        val url = intent.getStringExtra("videoUrl")
            ?: getSharedPreferences("charging_prefs", MODE_PRIVATE)
                .getString("appliedVideoUrl", null)

        if (url.isNullOrBlank()) {
            finish()
            return
        }

        videoView.setVideoURI(Uri.parse(url))
        videoView.setOnPreparedListener { mp ->
            mp.isLooping = true
            videoView.start()
        }
        videoView.setOnErrorListener { _, _, _ ->
            // Swallow errors to avoid getting stuck behind lockscreen
            finish()
            true
        }
    }

    private fun updateTime() {
        // locale-aware short time like "7:05 PM"
        val fmt = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault())
        timeText.text = fmt.format(Date())
    }

    private fun dp(v: Int): Int =
        (v * resources.displayMetrics.density).toInt()

    override fun onDestroy() {
        try { videoView.stopPlayback() } catch (_: Throwable) {}
        super.onDestroy()
    }
}
