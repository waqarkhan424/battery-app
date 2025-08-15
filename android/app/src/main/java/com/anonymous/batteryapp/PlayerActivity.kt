package com.anonymous.batteryapp

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity

/**
 * Lightweight fullscreen player used only for plug-in events.
 * - Runs before RN/JS is warm
 * - Loops the saved MP4
 * - Shows over lockscreen and turns screen on
 */
class PlayerActivity : AppCompatActivity() {

    private lateinit var videoView: VideoView

    override fun onCreate(savedInstanceState: Bundle?) {
        // Make visible when device is locked; turn screen on
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

        val container = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }
        videoView = VideoView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }
        container.addView(videoView)
        setContentView(container)

        playFromIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { playFromIntent(it) }
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

    override fun onDestroy() {
        try { videoView.stopPlayback() } catch (_: Throwable) {}
        super.onDestroy()
    }
}
