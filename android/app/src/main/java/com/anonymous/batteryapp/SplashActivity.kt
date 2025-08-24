package com.anonymous.batteryapp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {

    // How long to keep spinner + text visible (tweak as you like)
    private val SPLASH_DURATION_MS = 900L

    override fun onCreate(savedInstanceState: Bundle?) {
        // Android 12+ shows the system splash for this Activity first.
        // Then we render our custom layout below.
        setTheme(R.style.AppTheme)  // switch to normal theme for our layout
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        Handler(Looper.getMainLooper()).postDelayed({
            // Hand off to your existing RN MainActivity
            val intent = Intent(this, MainActivity::class.java).apply {
                action = Intent.ACTION_MAIN
                addCategory(Intent.CATEGORY_LAUNCHER)
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }
            startActivity(intent)
            finish()
        }, SPLASH_DURATION_MS)
    }
}
