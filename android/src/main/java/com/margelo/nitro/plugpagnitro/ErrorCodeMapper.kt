package com.margelo.nitro.plugpagnitro

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag

/**
 * Utility class for mapping PlugPag SDK error codes to Nitro error codes
 * Eliminates duplication across multiple methods
 */
object ErrorCodeMapper {
    
    /**
     * Maps PlugPag SDK result codes to Nitro ErrorCode enum
     * @param plugPagResult The result code from PlugPag SDK
     * @return Corresponding ErrorCode enum value
     */
    fun mapToErrorCode(plugPagResult: Int): ErrorCode {
        return when (plugPagResult) {
            PlugPag.RET_OK -> ErrorCode.OK
            PlugPag.OPERATION_ABORTED -> ErrorCode.OPERATION_ABORTED
            PlugPag.AUTHENTICATION_FAILED -> ErrorCode.AUTHENTICATION_FAILED
            PlugPag.COMMUNICATION_ERROR -> ErrorCode.COMMUNICATION_ERROR
            PlugPag.NO_PRINTER_DEVICE -> ErrorCode.NO_PRINTER_DEVICE
            PlugPag.NO_TRANSACTION_DATA -> ErrorCode.NO_TRANSACTION_DATA
            else -> ErrorCode.COMMUNICATION_ERROR
        }
    }
    
    /**
     * Maps PlugPag SDK result codes to string representation
     * @param plugPagResult The result code from PlugPag SDK
     * @return String representation of the error code
     */
    fun mapToErrorCodeString(plugPagResult: Int): String {
        return when (plugPagResult) {
            PlugPag.RET_OK -> "RET_OK"
            PlugPag.OPERATION_ABORTED -> "OPERATION_ABORTED"
            PlugPag.AUTHENTICATION_FAILED -> "AUTHENTICATION_FAILED"
            PlugPag.COMMUNICATION_ERROR -> "COMMUNICATION_ERROR"
            PlugPag.NO_PRINTER_DEVICE -> "NO_PRINTER_DEVICE"
            PlugPag.NO_TRANSACTION_DATA -> "NO_TRANSACTION_DATA"
            else -> "COMMUNICATION_ERROR"
        }
    }
}
