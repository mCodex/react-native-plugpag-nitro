package com.margelo.nitro.plugpagnitro

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Generic exception handler for consistent error handling across all operations
 * Eliminates repetitive try/catch blocks
 */
object OperationHandler {
    
    private const val TAG = "OperationHandler"
    
    /**
     * Executes an operation with consistent error handling and context switching
     * @param operationName Name of the operation for logging
     * @param operation The suspend function to execute
     * @return Result of the operation
     * @throws Exception with formatted error message
     */
    suspend fun <T> executeOperation(
        operationName: String,
        operation: suspend () -> T
    ): T {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Starting operation: $operationName")
                val result = operation()
                Log.d(TAG, "Operation completed successfully: $operationName")
                result
            } catch (e: Exception) {
                val errorMessage = "${operationName.uppercase()}_ERROR: ${e.message ?: "Unknown error"}"
                Log.e(TAG, "Error in operation $operationName", e)
                throw Exception(errorMessage)
            }
        }
    }
    
    /**
     * Simplified version for operations that don't need context switching
     */
    fun <T> executeSimpleOperation(
        operationName: String,
        operation: () -> T
    ): T {
        return try {
            operation()
        } catch (e: Exception) {
            val errorMessage = "${operationName.uppercase()}_ERROR: ${e.message ?: "Unknown error"}"
            Log.e(TAG, "Error in operation $operationName", e)
            throw Exception(errorMessage)
        }
    }
}
