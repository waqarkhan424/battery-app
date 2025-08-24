package com.anonymous.batteryapp

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {

    // How long to keep spinner + text visible when launching from app icon
    private val SPLASH_DURATION_MS = 900L

    override fun onCreate(savedInstanceState: Bundle?) {
        // System splash (Android 12+) shows first; then this theme/layout
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val incoming = intent

        // Case 1: Opened via deep link (batteryapp://... from QR / Google Lens)
        // Forward the SAME VIEW intent (keep action/data/categories) to MainActivity.
        if (Intent.ACTION_VIEW == incoming.action && incoming.data != null) {
            val forward = Intent(incoming).apply {
                setClass(this@SplashActivity, MainActivity::class.java)
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }
            startActivity(forward)
            finish()
            return
        }

        // Case 2: Normal launcher tap → show splash briefly, then open RN activity.
        Handler(Looper.getMainLooper()).postDelayed({
            val next = Intent(this, MainActivity::class.java).apply {
                // Do NOT overwrite action/categories here.
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
            }
            startActivity(next)
            finish()
        }, SPLASH_DURATION_MS)
    }
}
