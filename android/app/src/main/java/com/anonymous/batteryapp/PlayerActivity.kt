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
import android.os.SystemClock
import android.util.DisplayMetrics
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import java.text.DateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt

class PlayerActivity : AppCompatActivity() {

    private lateinit var videoView: VideoView
    private lateinit var timeText: TextView
    private lateinit var batteryPctText: TextView
    private lateinit var batteryIconText: TextView
    private lateinit var container: FrameLayout

    private val timeHandler = Handler(Looper.getMainLooper())
    private val autoFinishHandler = Handler(Looper.getMainLooper())
    private var durationMs: Int = -1
    private var closeMethod: String = "single"
    private var lastTapMs: Long = 0L
    private val doubleTapWindow = 300L

    private val timeTick = object : Runnable {
        override fun run() {
            updateTime()
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
        // Show on lock screen & turn screen on
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

        // Edge-to-edge content
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // --- build UI first ---
        container = FrameLayout(this).apply {
            setBackgroundColor(Color.BLACK)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
            setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_UP) {
                    if (closeMethod == "single") {
                        finish(); true
                    } else {
                        val now = SystemClock.elapsedRealtime()
                        if (now - lastTapMs <= doubleTapWindow) {
                            finish(); true
                        } else {
                            lastTapMs = now; true
                        }
                    }
                } else false
            }
        }

        videoView = VideoView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }
        container.addView(videoView)

        // Time (top)
        timeText = TextView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP or Gravity.CENTER_HORIZONTAL
            ).apply { topMargin = dp(18) }
            textSize = 22f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
        }
        container.addView(timeText)

        // Battery cluster (bottom)
        val bottomCluster = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            ).apply { bottomMargin = dp(24) }
            gravity = Gravity.CENTER_HORIZONTAL
        }
        val circleBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dp(999).toFloat()
            setColor(Color.parseColor("#1F1F1F"))
        }
        batteryIconText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(dp(56), dp(56))
            background = circleBg
            gravity = Gravity.CENTER
            textSize = 24f
            setTextColor(Color.WHITE)
        }
        batteryPctText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(10) }
            gravity = Gravity.CENTER
            textSize = 18f
            setTextColor(Color.WHITE)
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
        }
        bottomCluster.addView(batteryIconText)
        bottomCluster.addView(batteryPctText)
        container.addView(bottomCluster)

        setContentView(container)

        // Now it’s safe to hide system bars
        enterImmersiveMode()

        // Read persisted options AFTER building view (closeMethod affects tap handler semantics)
        val prefs = getSharedPreferences("charging_prefs", MODE_PRIVATE)
        durationMs = prefs.getInt("durationMs", -1)
        closeMethod = prefs.getString("closeMethod", "single") ?: "single"

        playFromIntent(intent)

        if (durationMs > 0) {
            autoFinishHandler.postDelayed({ try { finish() } catch (_: Throwable) {} }, durationMs.toLong())
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { playFromIntent(it) }
    }

    override fun onResume() {
        super.onResume()
        enterImmersiveMode()
        timeHandler.post(timeTick)

        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val sticky = registerReceiver(batteryReceiver, filter)
        if (sticky != null) batteryReceiver.onReceive(this, sticky)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enterImmersiveMode()
    }

    override fun onPause() {
        super.onPause()
        timeHandler.removeCallbacks(timeTick)
        try { unregisterReceiver(batteryReceiver) } catch (_: Throwable) {}
    }

    private fun playFromIntent(intent: Intent) {
        val url = intent.getStringExtra("videoUrl")
            ?: getSharedPreferences("charging_prefs", MODE_PRIVATE)
                .getString("appliedVideoUrl", null)

        if (url.isNullOrBlank()) {
            finish(); return
        }

        videoView.setVideoURI(Uri.parse(url))
        videoView.setOnPreparedListener { mp ->
            mp.isLooping = true
            val vw = mp.videoWidth
            val vh = mp.videoHeight
            if (vw > 0 && vh > 0) centerCropToScreen(vw, vh)
            mp.setOnVideoSizeChangedListener { _, w, h ->
                if (w > 0 && h > 0) centerCropToScreen(w, h)
            }
            videoView.start()
        }
        videoView.setOnErrorListener { _, _, _ ->
            finish(); true
        }
    }

    /** Hide system bars so the animation fully covers the display. */
    private fun enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController ?: return
            controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
            controller.systemBarsBehavior =
                WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } else {
            @Suppress("DEPRECATION")
            val target: View = if (::container.isInitialized) container else window.decorView
            target.systemUiVisibility =
                (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION)
        }
    }

    private fun centerCropToScreen(videoWidth: Int, videoHeight: Int) {
        val dm: DisplayMetrics = resources.displayMetrics
        val screenW = dm.widthPixels.toFloat()
        val screenH = dm.heightPixels.toFloat()

        val scale = max(screenW / videoWidth, screenH / videoHeight)
        val targetW = (videoWidth * scale).roundToInt()
        val targetH = (videoHeight * scale).roundToInt()

        val lp = videoView.layoutParams as FrameLayout.LayoutParams
        lp.width = targetW
        lp.height = targetH
        lp.gravity = Gravity.CENTER
        videoView.layoutParams = lp
        videoView.requestLayout()
    }

    private fun updateTime() {
        val fmt = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault())
        timeText.text = fmt.format(Date())
    }

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

    override fun onDestroy() {
        try { videoView.stopPlayback() } catch (_: Throwable) {}
        autoFinishHandler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
