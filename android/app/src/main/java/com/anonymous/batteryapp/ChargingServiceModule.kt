package com.anonymous.batteryapp

import android.content.Intent
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ChargingServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ChargingServiceModule"

    private fun prefs() =
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /** Start the foreground service and save player options */
    @ReactMethod
    fun startServiceWithOptions(videoUrl: String, durationMs: Int, closeMethod: String) {
        // Persist chosen options
        prefs().edit()
            .putString(KEY_APPLIED_URL, videoUrl)
            .putInt(KEY_DURATION_MS, durationMs)             // -1 = Always (no auto-dismiss)
            .putString(KEY_CLOSE_METHOD, closeMethod)        // "single" | "double"
            .apply()

        val intent = Intent(reactContext, ChargingAnimationService::class.java).apply {
            putExtra("videoUrl", videoUrl)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    /** For backward compatibility if ever called elsewhere (optional) */
    @ReactMethod
    fun startService(videoUrl: String) {
        startServiceWithOptions(videoUrl, -1, "single")
    }

    /** Stop the foreground service */
    @ReactMethod
    fun stopService() {
        val intent = Intent(reactContext, ChargingAnimationService::class.java)
        reactContext.stopService(intent)
    }

    companion object {
        private const val PREFS_NAME = "charging_prefs"
        const val KEY_APPLIED_URL = "appliedVideoUrl"
        const val KEY_DURATION_MS = "durationMs"
        const val KEY_CLOSE_METHOD = "closeMethod"
    }
}
