package com.charginganimation

import android.content.BroadcastReceiver
import android.content.Intent
import android.content.IntentFilter
import android.content.res.ColorStateList
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
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.widget.ImageViewCompat
import java.text.DateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt

class PlayerActivity : AppCompatActivity() {

    private lateinit var videoView: VideoView
    private lateinit var timeText: TextView
    private lateinit var batteryPctText: TextView
    private lateinit var batteryIconView: ImageView
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

            // Swap icon based on charging state (vector drawables)
            batteryIconView.setImageResource(
                if (isCharging) R.drawable.ic_battery_charging_full
                else R.drawable.ic_battery_full
            )

            // Make sure icon is clearly visible on black
            ImageViewCompat.setImageTintList(
                batteryIconView,
                ColorStateList.valueOf(Color.WHITE)
            )

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

        // --- Root container ---
        container = FrameLayout(this).apply {
            setBackgroundColor(Color.BLACK)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }

        // Video layer (fills screen)
        videoView = VideoView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }
        container.addView(videoView)

        // Compute a safe top inset (status bar / notch) so the time never touches the top
        val safeTopInset = run {
            var top = 0
            if (Build.VERSION.SDK_INT >= 28) {
                val cut = window.decorView.rootWindowInsets?.displayCutout
                top = max(top, cut?.safeInsetTop ?: 0)
            }
            val resId = resources.getIdentifier("status_bar_height", "dimen", "android")
            if (resId > 0) top = max(top, resources.getDimensionPixelSize(resId))
            top
        }

        // Time (top)
        timeText = TextView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP or Gravity.CENTER_HORIZONTAL
            ).apply { topMargin = safeTopInset + dp(18) }
            textSize = 22f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
        }
        container.addView(timeText)

        // Battery cluster (bottom) — HORIZONTAL row now
        val bottomCluster = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            ).apply { bottomMargin = dp(24) }
            // Center items vertically & horizontally in the row
            gravity = Gravity.CENTER
        }

        // NEW: ImageView for the icon (replaces emoji TextView)
        batteryIconView = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(dp(56), dp(56))
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            // Initial icon + tint; will be updated by receiver
            setImageResource(R.drawable.ic_battery_full)
            ImageViewCompat.setImageTintList(this, ColorStateList.valueOf(Color.WHITE))
        }

        batteryPctText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply { leftMargin = dp(12) }
            gravity = Gravity.CENTER
            textSize = 18f
            setTextColor(Color.WHITE)
            setShadowLayer(6f, 0f, 0f, Color.parseColor("#80000000"))
        }

        bottomCluster.addView(batteryIconView)
        bottomCluster.addView(batteryPctText)
        container.addView(bottomCluster)

        // >>> Touch catcher overlay (fixes tap-to-hide not firing) <<<
        val touchCatcher = View(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            // Ensure this view can receive touches and sits on top
            isClickable = true
            isFocusable = true

            setOnTouchListener { _, event ->
                when (event.actionMasked) {
                    MotionEvent.ACTION_DOWN -> {
                        // Claim the gesture so we will receive ACTION_UP
                        true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (closeMethod == "single") {
                            finish()
                            true
                        } else {
                            val now = SystemClock.elapsedRealtime()
                            if (now - lastTapMs <= doubleTapWindow) {
                                finish()
                                lastTapMs = 0L
                                true
                            } else {
                                lastTapMs = now
                                true
                            }
                        }
                    }
                    else -> true
                }
            }
        }
        container.addView(touchCatcher)

        setContentView(container)

        // Hide system bars
        enterImmersiveMode()

        // Read persisted options AFTER building view (affects tap semantics)
        val prefs = getSharedPreferences("charging_prefs", MODE_PRIVATE)
        durationMs = prefs.getInt("durationMs", -1)
        closeMethod = prefs.getString("closeMethod", "single") ?: "single"

        playFromIntent(intent)

        if (durationMs > 0) {
            autoFinishHandler.postDelayed(
                { try { finish() } catch (_: Throwable) {} },
                durationMs.toLong()
            )
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
        val sw = dm.widthPixels.toFloat()
        val sh = dm.heightPixels.toFloat()

        val vr = videoWidth.toFloat() / videoHeight.toFloat()
        val sr = sw / sh

        val lp = videoView.layoutParams as FrameLayout.LayoutParams
        if (vr > sr) {
            // video is wider → match height and crop left/right
            lp.height = ViewGroup.LayoutParams.MATCH_PARENT
            val w = (sh * vr).roundToInt()
            lp.width = max(w, dm.widthPixels)
        } else {
            // video is taller → match width and crop top/bottom
            lp.width = ViewGroup.LayoutParams.MATCH_PARENT
            val h = (sw / vr).roundToInt()
            lp.height = max(h, dm.heightPixels)
        }
        videoView.layoutParams = lp
    }

    private fun updateTime() {
        val now = Date()
        val time = DateFormat.getTimeInstance(DateFormat.SHORT, Locale.getDefault()).format(now)
        timeText.text = time
    }

    private fun dp(px: Int): Int =
        (resources.displayMetrics.density * px).roundToInt()
}
