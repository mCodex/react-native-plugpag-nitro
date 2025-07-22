package com.margelo.nitro.plugpagnitro

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class PlugpagEventEmitter(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

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
        fun emitPaymentEvent(code: Double, message: String) {
            instance?.let { emitter ->
                val params = Arguments.createMap().apply {
                    putDouble("code", code)
                    putString("message", message)
                }
                
                emitter.reactApplicationContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("paymentEvent", params)
            }
        }
    }
}
