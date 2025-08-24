package com.anonymous.batteryapp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    // How long to keep the splash screen visible
    private val SPLASH_DURATION_MS = 900L

    override fun onCreate(savedInstanceState: Bundle?) {
        // Use your app theme after the system splash screen
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Delay to show your custom splash layout, then start MainActivity
        Handler(Looper.getMainLooper()).postDelayed({
            // Forward the original intent’s action and data (for deep links)
            val startIntent = Intent(this, MainActivity::class.java).apply {
                action = intent.action
                data = intent.data
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
