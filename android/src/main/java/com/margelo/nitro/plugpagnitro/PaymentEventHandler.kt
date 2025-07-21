package com.margelo.nitro.plugpagnitro

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.margelo.nitro.NitroModules
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventListener

/**
 * Payment Event Handler for PlugPag Operations
 * Handles payment-related events and emits them to React Native
 */
class PaymentEventHandler(private val uiStateManager: UIStateManager) : PlugPagEventListener {
    
    private var countPassword = 0
    private var messageCard = ""
    
    companion object {
        private const val TAG = "PlugpagPaymentEvents"
        private const val EVENT_PAYMENTS = "eventPayments"
    }
    
    override fun onEvent(plugPagEventData: PlugPagEventData) {
        try {
            // Handle events based on custom message since PlugPagEventData may not have public eventType
            val message = plugPagEventData.customMessage ?: "Payment processing..."
            
            when {
                message.contains("senha", ignoreCase = true) || 
                message.contains("password", ignoreCase = true) -> {
                    emitPaymentEvent("WAITING_PASSWORD", "Please enter your password")
                }
                message.contains("cartão", ignoreCase = true) || 
                message.contains("card", ignoreCase = true) -> {
                    emitPaymentEvent("WAITING_CARD", "Please insert or approximate your card")
                }
                message.contains("aprovado", ignoreCase = true) ||
                message.contains("approved", ignoreCase = true) -> {
                    countPassword = 0
                    emitPaymentEvent("TRANSACTION_APPROVED", message)
                }
                message.contains("erro", ignoreCase = true) ||
                message.contains("error", ignoreCase = true) -> {
                    emitPaymentEvent("TRANSACTION_ERROR", message)
                }
                message.contains("cancelado", ignoreCase = true) ||
                message.contains("cancelled", ignoreCase = true) -> {
                    emitPaymentEvent("TRANSACTION_CANCELLED", message)
                }
                else -> {
                    emitPaymentEvent("PAYMENT_EVENT", message)
                }
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error handling payment event: ${e.message}", e)
            emitPaymentEvent("PAYMENT_ERROR", "Error processing payment event: ${e.message}")
        }
    }
    
    /**
     * Emit payment event to React Native
     */
    private fun emitPaymentEvent(eventType: String, message: String, additionalData: Map<String, Any>? = null) {
        try {
            val context = NitroModules.applicationContext
            if (context != null) {
                val eventData = Arguments.createMap().apply {
                    putString("eventType", eventType)
                    putString("message", message)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                    
                    additionalData?.forEach { (key, value) ->
                        when (value) {
                            is String -> putString(key, value)
                            is Boolean -> putBoolean(key, value)
                            is Int -> putInt(key, value)
                            is Double -> putDouble(key, value)
                            else -> putString(key, value.toString())
                        }
                    }
                }
                
                (context as? com.facebook.react.bridge.ReactApplicationContext)
                    ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit(EVENT_PAYMENTS, eventData)
                    
                Log.d(TAG, "Payment event emitted: $eventType - $message")
            } else {
                Log.w(TAG, "Cannot emit payment event - no React context available")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting payment event: ${e.message}", e)
        }
    }
    
    /**
     * Reset internal state
     */
    fun reset() {
        countPassword = 0
        messageCard = ""
    }
}
