package com.charginganimation

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

    /** Start the service again using whatever was saved last time (if any). */
    @ReactMethod
    fun startServiceIfConfigured() {
        val p = prefs()
        val url = p.getString(KEY_APPLIED_URL, null)
        // (Optional) read persisted options so PlayerActivity can pick them up
        val durationMs = p.getInt(KEY_DURATION_MS, -1)
        val closeMethod = p.getString(KEY_CLOSE_METHOD, "single") ?: "single"

        if (!url.isNullOrBlank()) {
            // Ensure prefs are populated (in case only URL existed)
            p.edit()
                .putString(KEY_APPLIED_URL, url)
                .putInt(KEY_DURATION_MS, durationMs)
                .putString(KEY_CLOSE_METHOD, closeMethod)
                .apply()

            val intent = Intent(reactContext, ChargingAnimationService::class.java).apply {
                putExtra("videoUrl", url)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
        }
        // If no URL saved, do nothing (user hasn’t applied yet).
    }

    companion object {
        private const val PREFS_NAME = "charging_prefs"
        const val KEY_APPLIED_URL = "appliedVideoUrl"
        const val KEY_DURATION_MS = "durationMs"
        const val KEY_CLOSE_METHOD = "closeMethod"
    }
}
