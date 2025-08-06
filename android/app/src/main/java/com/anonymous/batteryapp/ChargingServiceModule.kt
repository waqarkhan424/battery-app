package com.anonymous.batteryapp

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ChargingServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ChargingServiceModule"

    /** Start the foreground service and tell it which video to show */
    @ReactMethod
    fun startService(videoUrl: String) {
        val intent = Intent(reactContext, ChargingAnimationService::class.java).apply {
            putExtra("videoUrl", videoUrl)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    /** Stop the foreground service */
    @ReactMethod
    fun stopService() {
        val intent = Intent(reactContext, ChargingAnimationService::class.java)
        reactContext.stopService(intent)
    }
}
