package com.margelo.nitro.plugpagnitro

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult as PlugPagSDKResult

/**
 * Builder pattern for creating PlugpagTransactionResult objects
 * Eliminates duplication in result object creation
 */
object TransactionResultBuilder {
    
    /**
     * Creates a PlugpagTransactionResult from PlugPag SDK result
     * @param sdkResult The result from PlugPag SDK
     * @return Formatted PlugpagTransactionResult for Nitro
     */
    fun buildFrom(sdkResult: PlugPagSDKResult): PlugpagTransactionResult {
        val errorCode = ErrorCodeMapper.mapToErrorCode(sdkResult.result ?: -1)
        
        return PlugpagTransactionResult(
            result = errorCode,
            errorCode = sdkResult.errorCode ?: "",
            message = sdkResult.message ?: "",
            transactionCode = sdkResult.transactionCode ?: "",
            transactionId = sdkResult.transactionId ?: "",
            hostNsu = sdkResult.hostNsu ?: "",
            date = sdkResult.date ?: "",
            time = sdkResult.time ?: "",
            cardBrand = sdkResult.cardBrand ?: "",
            bin = sdkResult.bin ?: "",
            holder = sdkResult.holder ?: "",
            userReference = sdkResult.userReference ?: "",
            terminalSerialNumber = sdkResult.terminalSerialNumber ?: "",
            amount = sdkResult.amount ?: "",
            availableBalance = sdkResult.availableBalance ?: "",
            cardApplication = sdkResult.cardApplication ?: "",
            label = sdkResult.label ?: "",
            holderName = sdkResult.holderName ?: "",
            extendedHolderName = sdkResult.extendedHolderName ?: ""
        )
    }
}
