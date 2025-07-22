package com.margelo.nitro.plugpagnitro

import android.content.Context
import android.os.Build
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import com.margelo.nitro.NitroModules
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPaymentData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagVoidData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData

@DoNotStrip
class PlugpagNitro : HybridPlugpagNitroSpec() {
  
  private lateinit var plugPag: PlugPag
  private val eventContext = mutableMapOf<String, Any>()

  companion object {
    private const val TAG = "PlugpagNitro"
  }

  override fun getConstants(): PlugpagConstants {
    return PlugpagConstants(
      // Payment Types
      PAYMENT_CREDITO = PlugPag.TYPE_CREDITO.toDouble(),
      PAYMENT_DEBITO = PlugPag.TYPE_DEBITO.toDouble(),
      PAYMENT_VOUCHER = PlugPag.TYPE_VOUCHER.toDouble(),
      PAYMENT_PIX = PlugPag.TYPE_PIX.toDouble(),
      
      // Installment Types
      INSTALLMENT_TYPE_A_VISTA = PlugPag.INSTALLMENT_TYPE_A_VISTA.toDouble(),
      INSTALLMENT_TYPE_PARC_VENDEDOR = PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR.toDouble(),
      INSTALLMENT_TYPE_PARC_COMPRADOR = PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR.toDouble(),
      
      // Error Codes
      ERROR_CODE_OK = PlugPag.ERROR_CODE_OK.toDouble(),
      OPERATION_ABORTED = PlugPag.OPERATION_ABORTED.toDouble(),
      AUTHENTICATION_FAILED = PlugPag.AUTHENTICATION_FAILED.toDouble(),
      COMMUNICATION_ERROR = PlugPag.COMMUNICATION_ERROR.toDouble(),
      NO_PRINTER_DEVICE = PlugPag.NO_PRINTER_DEVICE.toDouble(),
      NO_TRANSACTION_DATA = PlugPag.NO_TRANSACTION_DATA.toDouble(),
      
      // Actions
      ACTION_POST_OPERATION = PlugPag.ACTION_POST_OPERATION.toDouble(),
      ACTION_PRE_OPERATION = PlugPag.ACTION_PRE_OPERATION.toDouble(),
      ACTION_UPDATE = PlugPag.ACTION_UPDATE.toDouble()
    )
  }

  override fun getTerminalSerialNumber(): String {
    return OperationHandler.executeSimpleOperation("getTerminalSerialNumber") {
      when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O -> {
          try {
            Build.getSerial()
          } catch (e: SecurityException) {
            Log.w(TAG, "Permission required to access serial number", e)
            "PERMISSION_REQUIRED"
          }
        }
        else -> {
          @Suppress("DEPRECATION")
          Build.SERIAL ?: "UNKNOWN"
        }
      }
    }
  }

  override fun initializeAndActivatePinPad(activationCode: String): Promise<PlugpagInitializationResult> {
    return Promise.async {
      OperationHandler.executeOperation("initializeAndActivatePinPad") {
        initializePlugPag()
        
        val activationData = PlugPagActivationData(activationCode)
        val result = plugPag.initializeAndActivatePinpad(activationData)
        
        PlugpagInitializationResult(
          result = ErrorCodeMapper.mapToErrorCode(result.result),
          errorCode = result.errorCode ?: "",
          errorMessage = result.errorMessage ?: ""
        )
      }
    }
  }


  override fun doPayment(
    amount: Double,
    type: PaymentType,
    installmentType: InstallmentType,
    installments: Double,
    printReceipt: Boolean,
    userReference: String
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      OperationHandler.executeOperation("doPayment") {
        initializePlugPag()
        
        val plugPagPaymentData = PlugPagPaymentData(
          mapPaymentType(type),
          amount.toInt(),
          mapInstallmentType(installmentType),
          installments.toInt(),
          userReference,
          printReceipt
        )
        
        setupPaymentEventListener()
        
        // Emit initial event
        PlugpagEventEmitter.emitPaymentEvent(1004.0, "Aguardando cartão...")
        
        val result = plugPag.doPayment(plugPagPaymentData)
        
        clearEventListener()
        emitFinalEvent(result.result ?: -1)
        
        TransactionResultBuilder.buildFrom(result)
      }
    }
  }

  override fun refundPayment(
    transactionCode: String,
    transactionId: String,
    printReceipt: Boolean
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      OperationHandler.executeOperation("refundPayment") {
        initializePlugPag()
        
        val plugPagVoidData = PlugPagVoidData(
          transactionCode,
          transactionId,
          printReceipt
        )
        
        val result = plugPag.voidPayment(plugPagVoidData)
        TransactionResultBuilder.buildFrom(result)
      }
    }
  }

  override fun doAbort(): Promise<PlugpagAbortResult> {
    return Promise.async {
      OperationHandler.executeOperation("doAbort") {
        initializePlugPag()
        val result = plugPag.abort()
        
        PlugpagAbortResult(
          result = result.result == PlugPag.RET_OK
        )
      }
    }
  }

  override fun print(filePath: String): Promise<Unit> {
    return Promise.async {
      OperationHandler.executeOperation("print") {
        initializePlugPag()
        val printerData = PlugPagPrinterData(filePath, 4, 0)
        
        plugPag.setPrinterListener(createPrinterListener())
        plugPag.printFromFile(printerData)
        Unit
      }
    }
  }

  override fun reprintCustomerReceipt(): Promise<Unit> {
    return Promise.async {
      OperationHandler.executeOperation("reprintCustomerReceipt") {
        initializePlugPag()
        plugPag.reprintCustomerReceipt()
        Unit
      }
    }
  }

  // Private helper methods - extracted for reusability
  
  private fun initializePlugPag() {
    if (!::plugPag.isInitialized) {
      val context = NitroModules.applicationContext as Context
      plugPag = PlugPag(context)
    }
  }
  
  private fun mapPaymentType(type: PaymentType): Int {
    return when (type) {
      PaymentType.CREDIT -> PlugPag.TYPE_CREDITO
      PaymentType.DEBIT -> PlugPag.TYPE_DEBITO
      PaymentType.VOUCHER -> PlugPag.TYPE_VOUCHER
      PaymentType.PIX -> PlugPag.TYPE_PIX
    }
  }
  
  private fun mapInstallmentType(installmentType: InstallmentType): Int {
    return when (installmentType) {
      InstallmentType.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
      InstallmentType.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
      InstallmentType.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
    }
  }
  
  private fun setupPaymentEventListener() {
    eventContext["passwordCount"] = 0
    
    plugPag.setEventListener(object : PlugPagEventListener {
      override fun onEvent(plugPagEventData: PlugPagEventData) {
        // Handle password count tracking
        if (plugPagEventData.eventCode == PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD) {
          val currentCount = eventContext["passwordCount"] as Int
          eventContext["passwordCount"] = currentCount + 1
        } else if (plugPagEventData.eventCode == PlugPagEventData.EVENT_CODE_NO_PASSWORD) {
          eventContext["passwordCount"] = 0
        }
        
        PaymentEventHandler.handleEvent(plugPagEventData, eventContext)
      }
    })
  }
  
  private fun clearEventListener() {
    try {
      plugPag.setEventListener(object : PlugPagEventListener {
        override fun onEvent(plugPagEventData: PlugPagEventData) {
          // No-op listener to clear events
        }
      })
    } catch (e: Exception) {
      Log.w(TAG, "Could not clear event listener", e)
    }
  }
  
  private fun emitFinalEvent(result: Int) {
    val (code, message) = when (result) {
      PlugPag.RET_OK -> 1031.0 to "Transação aprovada"
      else -> 1032.0 to "Transação negada"
    }
    PlugpagEventEmitter.emitPaymentEvent(code, message)
  }
  
  private fun createPrinterListener(): PlugPagPrinterListener {
    return object : PlugPagPrinterListener {
      override fun onError(result: PlugPagPrintResult) {
        Log.e(TAG, "Print error: ${result.message}")
      }
      
      override fun onSuccess(result: PlugPagPrintResult) {
        Log.d(TAG, "Print success")
      }
    }
  }
}
