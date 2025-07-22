package com.margelo.nitro.plugpagnitro

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData
import android.util.Log

/**
 * Configuration-driven event handler for payment events
 * Reduces complex switch statements to simple configuration
 */
object PaymentEventHandler {
    
    private const val TAG = "PaymentEventHandler"
    
    // Event configuration mapping
    private val eventConfig = mapOf(
        // Password events
        PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD to EventConfig(
            baseCode = 1010.0,
            messageProvider = { data, context -> 
                val count = context["passwordCount"] as? Int ?: 0
                "Senha: ${"*".repeat(minOf(count, 6))}"
            }
        ),
        PlugPagEventData.EVENT_CODE_NO_PASSWORD to EventConfig(
            baseCode = 1011.0,
            message = "Digite sua senha"
        )
    )
    
    // Pattern-based event mapping for dynamic messages
    private val patternConfig = listOf(
        PatternConfig(
            patterns = listOf("cartão", "card"),
            subPatterns = mapOf(
                listOf("inserir", "insert") to EventConfig(1004.0, "Aguardando cartão..."),
                listOf("remov", "retire") to EventConfig(1030.0, "Retire o cartão")
            ),
            defaultConfig = EventConfig(1001.0, "Cartão detectado")
        ),
        PatternConfig(
            patterns = listOf("processa", "process"),
            defaultConfig = EventConfig(1020.0, "Processando transação...")
        ),
        PatternConfig(
            patterns = listOf("conecta", "connect"),
            defaultConfig = EventConfig(1021.0, "Conectando à rede...")
        ),
        PatternConfig(
            patterns = listOf("envian", "send"),
            defaultConfig = EventConfig(1022.0, "Enviando dados...")
        ),
        PatternConfig(
            patterns = listOf("aguard", "wait"),
            defaultConfig = EventConfig(1023.0, "Aguardando resposta...")
        ),
        PatternConfig(
            patterns = listOf("aprovad", "approved"),
            defaultConfig = EventConfig(1031.0, "Transação aprovada")
        ),
        PatternConfig(
            patterns = listOf("negad", "denied", "recusad"),
            defaultConfig = EventConfig(1032.0, "Transação negada")
        )
    )
    
    /**
     * Handles payment events using configuration-driven approach
     * @param eventData The event data from PlugPag SDK
     * @param context Additional context (like password count)
     */
    fun handleEvent(eventData: PlugPagEventData, context: MutableMap<String, Any> = mutableMapOf()) {
        val eventCode = eventData.eventCode
        val message = eventData.customMessage ?: ""
        
        // Handle specific event codes first
        eventConfig[eventCode]?.let { config ->
            val finalMessage = config.messageProvider?.invoke(eventData, context) 
                ?: config.message 
                ?: message
            emitEvent(config.baseCode, finalMessage)
            return
        }
        
        // Handle pattern-based events
        if (message.isNotEmpty()) {
            patternConfig.forEach { patternConfig ->
                if (patternConfig.patterns.any { pattern -> 
                    message.contains(pattern, ignoreCase = true) 
                }) {
                    // Check sub-patterns first
                    patternConfig.subPatterns?.forEach { (subPatterns, config) ->
                        if (subPatterns.any { subPattern -> 
                            message.contains(subPattern, ignoreCase = true) 
                        }) {
                            emitEvent(config.baseCode, config.message ?: message)
                            return
                        }
                    }
                    // Use default pattern config
                    emitEvent(
                        patternConfig.defaultConfig.baseCode,
                        patternConfig.defaultConfig.message ?: message
                    )
                    return
                }
            }
            
            // Default case for unknown patterns
            emitEvent(1020.0, message)
        }
    }
    
    private fun emitEvent(code: Double, message: String) {
        Log.d(TAG, "Emitting event - Code: $code, Message: $message")
        PlugpagEventEmitter.emitPaymentEvent(code, message)
    }
    
    // Configuration data classes
    data class EventConfig(
        val baseCode: Double,
        val message: String? = null,
        val messageProvider: ((PlugPagEventData, Map<String, Any>) -> String)? = null
    )
    
    data class PatternConfig(
        val patterns: List<String>,
        val subPatterns: Map<List<String>, EventConfig>? = null,
        val defaultConfig: EventConfig
    )
}
