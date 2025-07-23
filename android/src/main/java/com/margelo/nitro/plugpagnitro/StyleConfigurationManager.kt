package com.margelo.nitro.plugpagnitro

import android.graphics.Color
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagStyleData

/**
 * Utility class for managing PagBank SDK style customization
 * Handles conversion between Nitro style data and PlugPagStyleData
 */
object StyleConfigurationManager {
    
    /**
     * Converts a hex color string to Android Color integer
     * Supports formats: #RGB, #ARGB, #RRGGBB, #AARRGGBB
     * @param hexColor Hex color string
     * @return Android Color integer or null if invalid
     */
    private fun parseHexColor(hexColor: String?): Int? {
        if (hexColor.isNullOrBlank()) return null
        
        return try {
            val colorString = if (hexColor.startsWith("#")) {
                hexColor
            } else {
                "#$hexColor"
            }
            Color.parseColor(colorString)
        } catch (e: IllegalArgumentException) {
            null
        }
    }
    
    /**
     * Creates a PlugPagStyleData from Nitro style configuration
     * @param styleData Map containing style properties from JavaScript
     * @return PlugPagStyleData configured with the provided colors
     */
    fun createStyleData(styleData: Map<String, Any?>): PlugPagStyleData {
        return PlugPagStyleData(
            headTextColor = parseHexColor(styleData["headTextColor"] as? String),
            headBackgroundColor = parseHexColor(styleData["headBackgroundColor"] as? String),
            contentTextColor = parseHexColor(styleData["contentTextColor"] as? String),
            contentTextValue1Color = parseHexColor(styleData["contentTextValue1Color"] as? String),
            contentTextValue2Color = parseHexColor(styleData["contentTextValue2Color"] as? String),
            positiveButtonTextColor = parseHexColor(styleData["positiveButtonTextColor"] as? String),
            positiveButtonBackground = parseHexColor(styleData["positiveButtonBackground"] as? String),
            negativeButtonTextColor = parseHexColor(styleData["negativeButtonTextColor"] as? String),
            negativeButtonBackground = parseHexColor(styleData["negativeButtonBackground"] as? String),
            genericButtonBackground = parseHexColor(styleData["genericButtonBackground"] as? String),
            genericButtonTextColor = parseHexColor(styleData["genericButtonTextColor"] as? String),
            genericSmsEditTextBackground = parseHexColor(styleData["genericSmsEditTextBackground"] as? String),
            genericSmsEditTextTextColor = parseHexColor(styleData["genericSmsEditTextTextColor"] as? String),
            lineColor = parseHexColor(styleData["lineColor"] as? String)
        )
    }
    
    /**
     * Creates a PlugPagStyleData from Nitro generated PlugpagStyleData
     * @param nitroStyleData Nitro generated style data
     * @return PlugPagStyleData configured with the provided colors
     */
    fun createStyleDataFromNitro(nitroStyleData: com.margelo.nitro.plugpagnitro.PlugpagStyleData): PlugPagStyleData {
        return try {
            // Use reflection to call setStyleData method
            val plugPagClass = Class.forName("br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag")
            val methods = plugPagClass.methods
            
            // Check if setStyleData method exists
            val hasSetStyleData = methods.any { it.name == "setStyleData" }
            
            if (hasSetStyleData) {
                // Method exists, create the style data
                PlugPagStyleData(
                    headTextColor = parseHexColor(nitroStyleData.headTextColor),
                    headBackgroundColor = parseHexColor(nitroStyleData.headBackgroundColor),
                    contentTextColor = parseHexColor(nitroStyleData.contentTextColor),
                    contentTextValue1Color = parseHexColor(nitroStyleData.contentTextValue1Color),
                    contentTextValue2Color = parseHexColor(nitroStyleData.contentTextValue2Color),
                    positiveButtonTextColor = parseHexColor(nitroStyleData.positiveButtonTextColor),
                    positiveButtonBackground = parseHexColor(nitroStyleData.positiveButtonBackground),
                    negativeButtonTextColor = parseHexColor(nitroStyleData.negativeButtonTextColor),
                    negativeButtonBackground = parseHexColor(nitroStyleData.negativeButtonBackground),
                    genericButtonBackground = parseHexColor(nitroStyleData.genericButtonBackground),
                    genericButtonTextColor = parseHexColor(nitroStyleData.genericButtonTextColor),
                    genericSmsEditTextBackground = parseHexColor(nitroStyleData.genericSmsEditTextBackground),
                    genericSmsEditTextTextColor = parseHexColor(nitroStyleData.genericSmsEditTextTextColor),
                    lineColor = parseHexColor(nitroStyleData.lineColor)
                )
            } else {
                throw UnsupportedOperationException("setStyleData method not available in this PlugPag SDK version")
            }
        } catch (e: Exception) {
            throw RuntimeException("Theme configuration failed: ${e.message}")
        }
    }
    
    /**
     * Creates a dark theme style configuration
     * @return PlugPagStyleData with dark theme colors
     */
    fun createDarkTheme(): PlugPagStyleData {
        return PlugPagStyleData(
            headTextColor = Color.WHITE,
            headBackgroundColor = Color.parseColor("#1A1A1D"),
            contentTextColor = Color.WHITE,
            contentTextValue1Color = Color.parseColor("#00D4FF"),
            contentTextValue2Color = Color.parseColor("#A1A1AA"),
            positiveButtonTextColor = Color.WHITE,
            positiveButtonBackground = Color.parseColor("#22C55E"),
            negativeButtonTextColor = Color.WHITE,
            negativeButtonBackground = Color.parseColor("#EF4444"),
            genericButtonBackground = Color.parseColor("#2A2A2F"),
            genericButtonTextColor = Color.WHITE,
            genericSmsEditTextBackground = Color.parseColor("#2A2A2F"),
            genericSmsEditTextTextColor = Color.WHITE,
            lineColor = Color.parseColor("#71717A")
        )
    }
    
    /**
     * Creates a light theme style configuration
     * @return PlugPagStyleData with light theme colors
     */
    fun createLightTheme(): PlugPagStyleData {
        return PlugPagStyleData(
            headTextColor = Color.parseColor("#1F2937"),
            headBackgroundColor = Color.WHITE,
            contentTextColor = Color.parseColor("#1F2937"),
            contentTextValue1Color = Color.parseColor("#0EA5E9"),
            contentTextValue2Color = Color.parseColor("#6B7280"),
            positiveButtonTextColor = Color.WHITE,
            positiveButtonBackground = Color.parseColor("#10B981"),
            negativeButtonTextColor = Color.WHITE,
            negativeButtonBackground = Color.parseColor("#EF4444"),
            genericButtonBackground = Color.parseColor("#F3F4F6"),
            genericButtonTextColor = Color.parseColor("#1F2937"),
            genericSmsEditTextBackground = Color.parseColor("#F9FAFB"),
            genericSmsEditTextTextColor = Color.parseColor("#1F2937"),
            lineColor = Color.parseColor("#E5E7EB")
        )
    }
}
