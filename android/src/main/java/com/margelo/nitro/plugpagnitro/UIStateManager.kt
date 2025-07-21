package com.margelo.nitro.plugpagnitro

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.margelo.nitro.NitroModules

/**
 * UI State Management for PlugPag Operations
 * Handles UI configuration and event emission
 */
class UIStateManager {
    
    // UI Configuration
    private var showDefaultUI = true
    private var allowCancellation = true
    private var defaultTimeoutSeconds = 60
    private var customMessages = mutableMapOf<String, String>()
    
    // Cancellation management
    private val activeCancellationTokens = mutableSetOf<String>()
    private val cancellationCallbacks = mutableMapOf<String, () -> Unit>()
    
    companion object {
        private const val TAG = "PlugpagUIManager"
        private const val EVENT_UI_STATE = "eventUIState"
    }
    
    /**
     * Configure UI settings
     */
    fun configureUI(
        showDefaultUI: Boolean? = null,
        allowCancellation: Boolean? = null,
        timeoutSeconds: Int? = null,
        customMessages: Map<String, String>? = null
    ) {
        showDefaultUI?.let { this.showDefaultUI = it }
        allowCancellation?.let { this.allowCancellation = it }
        timeoutSeconds?.let { this.defaultTimeoutSeconds = it }
        customMessages?.let { this.customMessages.putAll(it) }
        
        Log.i(TAG, "UI configured - showDefaultUI: ${this.showDefaultUI}, allowCancellation: ${this.allowCancellation}")
    }
    
    /**
     * Register cancellation token
     */
    fun registerCancellationToken(token: String, callback: () -> Unit) {
        if (allowCancellation) {
            activeCancellationTokens.add(token)
            cancellationCallbacks[token] = callback
            Log.d(TAG, "Registered cancellation token: $token")
        }
    }
    
    /**
     * Execute cancellation callback
     */
    fun executeCancellation(token: String): Boolean {
        return cancellationCallbacks[token]?.let { callback ->
            try {
                callback()
                cleanupCancellationToken(token)
                Log.i(TAG, "Executed cancellation for token: $token")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error executing cancellation for token $token: ${e.message}", e)
                false
            }
        } ?: false
    }
    
    /**
     * Cleanup cancellation token
     */
    fun cleanupCancellationToken(token: String) {
        activeCancellationTokens.remove(token)
        cancellationCallbacks.remove(token)
        Log.d(TAG, "Cleaned up cancellation token: $token")
    }
    
    /**
     * Cleanup all cancellation tokens
     */
    fun cleanupAllCancellationTokens() {
        activeCancellationTokens.clear()
        cancellationCallbacks.clear()
        Log.d(TAG, "Cleaned up all cancellation tokens")
    }
    
    /**
     * Emit UI state event to React Native
     */
    fun emitUIStateEvent(
        state: String, 
        cancellationToken: String? = null, 
        cancellable: Boolean = false,
        additionalData: Map<String, Any>? = null
    ) {
        try {
            val context = NitroModules.applicationContext
            if (context != null) {
                val eventData = Arguments.createMap().apply {
                    putString("state", state)
                    putBoolean("cancellable", cancellable)
                    cancellationToken?.let { putString("cancellationToken", it) }
                    
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
                    ?.emit(EVENT_UI_STATE, eventData)
                
                Log.d(TAG, "Emitted UI state event: $state")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting UI state event: ${e.message}", e)
        }
    }
    
    // Getters for current configuration
    fun getShowDefaultUI(): Boolean = showDefaultUI
    fun getAllowCancellation(): Boolean = allowCancellation
    fun getDefaultTimeoutSeconds(): Int = defaultTimeoutSeconds
    fun getCustomMessages(): Map<String, String> = customMessages.toMap()
    fun getActiveCancellationTokens(): Set<String> = activeCancellationTokens.toSet()
}
