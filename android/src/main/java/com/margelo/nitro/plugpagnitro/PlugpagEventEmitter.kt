package com.margelo.nitro.plugpagnitro

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class PlugpagEventEmitter(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        // Save instance for emitting events
        setInstance(this)
    }
    
    override fun getName(): String {
        return "PlugpagEventEmitter"
    }

    companion object {
        private var instance: PlugpagEventEmitter? = null

        @JvmStatic
        fun setInstance(emitter: PlugpagEventEmitter) {
            instance = emitter
        }

        @JvmStatic
        fun emitPaymentEvent(code: Double, message: String, customMessage: String? = null) {
            android.util.Log.d("PlugpagEventEmitter", "Emitting event - code: $code, message: $message")
            instance?.let { emitter ->
                val params = Arguments.createMap().apply {
                    putDouble("code", code)
                    putString("message", message)
                    putString("customMessage", customMessage ?: "")
                }
                emitter.reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("paymentEvent", params)
            } ?: android.util.Log.e("PlugpagEventEmitter", "Instance is null - cannot emit event")
        }
    }
}
