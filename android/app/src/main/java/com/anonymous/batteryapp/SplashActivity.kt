package com.anonymous.batteryapp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    // How long to keep spinner + text visible
    private val SPLASH_DURATION_MS = 900L

    override fun onCreate(savedInstanceState: Bundle?) {
        // switch to normal theme for our layout
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        Handler(Looper.getMainLooper()).postDelayed({
            // Hand off to MainActivity and forward any data URI or action
            val startIntent = Intent(this, MainActivity::class.java).apply {
                action = intent.action      // carry over ACTION_VIEW, etc.
                data = intent.data          // carry over data URI (batteryapp://…)
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }
            startActivity(startIntent)
            finish()
        }, SPLASH_DURATION_MS)
    }
}
