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
import com.margelo.nitro.plugpagnitro.PlugpagEventEmitter

@DoNotStrip
class PlugpagNitro : HybridPlugpagNitroSpec() {
  
  private lateinit var plugPag: PlugPag

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
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Build.getSerial()
      } else {
        @Suppress("DEPRECATION")
        Build.SERIAL ?: "UNKNOWN"
      }
    } catch (e: SecurityException) {
      Log.w(TAG, "Permission required to access serial number", e)
      "PERMISSION_REQUIRED"
    } catch (e: Exception) {
      Log.e(TAG, "Error getting terminal serial number", e)
      "UNKNOWN"
    }
  }

  override fun initializeAndActivatePinPad(activationCode: String): Promise<PlugpagInitializationResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          
          val activationData = PlugPagActivationData(activationCode)
          val result = plugPag.initializeAndActivatePinpad(activationData)
          
          val errorCode = when (result.result) {
            PlugPag.RET_OK -> ErrorCode.OK
            PlugPag.OPERATION_ABORTED -> ErrorCode.OPERATION_ABORTED
            PlugPag.AUTHENTICATION_FAILED -> ErrorCode.AUTHENTICATION_FAILED
            PlugPag.COMMUNICATION_ERROR -> ErrorCode.COMMUNICATION_ERROR
            PlugPag.NO_PRINTER_DEVICE -> ErrorCode.NO_PRINTER_DEVICE
            PlugPag.NO_TRANSACTION_DATA -> ErrorCode.NO_TRANSACTION_DATA
            else -> ErrorCode.COMMUNICATION_ERROR
          }
          
          PlugpagInitializationResult(
            result = errorCode,
            errorCode = result.errorCode ?: "",
            errorMessage = result.errorMessage ?: ""
          )
        } catch (e: Exception) {
          Log.e(TAG, "Error initializing pin pad", e)
          throw Exception("INITIALIZATION_ERROR: ${e.message ?: "Unknown error"}")
        }
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
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          
          // Convert enum to PlugPag SDK constants
          val paymentType = when (type) {
            PaymentType.CREDIT -> PlugPag.TYPE_CREDITO
            PaymentType.DEBIT -> PlugPag.TYPE_DEBITO
            PaymentType.VOUCHER -> PlugPag.TYPE_VOUCHER
            PaymentType.PIX -> PlugPag.TYPE_PIX
          }
          
          val installmentTypeInt = when (installmentType) {
            InstallmentType.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
            InstallmentType.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
            InstallmentType.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
          }
          
          val plugPagPaymentData = PlugPagPaymentData(
            paymentType,
            amount.toInt(),
            installmentTypeInt,
            installments.toInt(),
            userReference,
            printReceipt
          )
          
          val result = plugPag.doPayment(plugPagPaymentData)
          
          val errorCode = when (result.result) {
            PlugPag.RET_OK -> ErrorCode.OK
            PlugPag.OPERATION_ABORTED -> ErrorCode.OPERATION_ABORTED
            PlugPag.AUTHENTICATION_FAILED -> ErrorCode.AUTHENTICATION_FAILED
            PlugPag.COMMUNICATION_ERROR -> ErrorCode.COMMUNICATION_ERROR
            PlugPag.NO_PRINTER_DEVICE -> ErrorCode.NO_PRINTER_DEVICE
            PlugPag.NO_TRANSACTION_DATA -> ErrorCode.NO_TRANSACTION_DATA
            else -> ErrorCode.COMMUNICATION_ERROR
          }
          
          PlugpagTransactionResult(
            result = errorCode,
            errorCode = result.errorCode ?: "",
            message = result.message ?: "",
            transactionCode = result.transactionCode ?: "",
            transactionId = result.transactionId ?: "",
            hostNsu = result.hostNsu ?: "",
            date = result.date ?: "",
            time = result.time ?: "",
            cardBrand = result.cardBrand ?: "",
            bin = result.bin ?: "",
            holder = result.holder ?: "",
            userReference = result.userReference ?: "",
            terminalSerialNumber = result.terminalSerialNumber ?: "",
            amount = result.amount ?: "",
            availableBalance = result.availableBalance ?: "",
            cardApplication = result.cardApplication ?: "",
            label = result.label ?: "",
            holderName = result.holderName ?: "",
            extendedHolderName = result.extendedHolderName ?: ""
          )
        } catch (e: Exception) {
          Log.e(TAG, "Error processing payment", e)
          throw Exception("PAYMENT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun doPaymentWithEvents(
    amount: Double,
    type: PaymentType,
    installmentType: InstallmentType,
    installments: Double,
    printReceipt: Boolean,
    userReference: String
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          
          // Convert enum to PlugPag SDK constants
          val paymentType = when (type) {
            PaymentType.CREDIT -> PlugPag.TYPE_CREDITO
            PaymentType.DEBIT -> PlugPag.TYPE_DEBITO
            PaymentType.VOUCHER -> PlugPag.TYPE_VOUCHER
            PaymentType.PIX -> PlugPag.TYPE_PIX
          }
          
          val installmentTypeInt = when (installmentType) {
            InstallmentType.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
            InstallmentType.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
            InstallmentType.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
          }
          
          val plugPagPaymentData = PlugPagPaymentData(
            paymentType,
            amount.toInt(),
            installmentTypeInt,
            installments.toInt(),
            userReference,
            printReceipt
          )
          
          // Set up event listener for real-time payment events
          var passwordCount = 0
          plugPag.setEventListener(object : PlugPagEventListener {
            override fun onEvent(plugPagEventData: PlugPagEventData) {
              val eventCode = plugPagEventData.eventCode
              var message = plugPagEventData.customMessage ?: ""
              
              // Handle specific events and enhance messages
              when (eventCode) {
                PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> {
                  passwordCount++
                  message = when (passwordCount) {
                    1 -> "Senha: *"
                    2 -> "Senha: **"
                    3 -> "Senha: ***"
                    4 -> "Senha: ****"
                    5 -> "Senha: *****"
                    6 -> "Senha: ******"
                    else -> "Senha: ****"
                  }
                      PlugpagEventEmitter.emitPaymentEvent(1010.0, message)
                }
                PlugPagEventData.EVENT_CODE_NO_PASSWORD -> {
                  passwordCount = 0
                  message = "Digite sua senha"
                  PlugpagEventEmitter.emitPaymentEvent(1011.0, message)
                }
                else -> {
                  // Handle other events with generic messages
                  when {
                    message.contains("cartão", ignoreCase = true) || 
                    message.contains("card", ignoreCase = true) -> {
                      if (message.contains("inserir", ignoreCase = true) || 
                          message.contains("insert", ignoreCase = true)) {
                        PlugpagEventEmitter.emitPaymentEvent(1004.0, "Aguardando cartão...")
                      } else if (message.contains("remov", ignoreCase = true) ||
                                 message.contains("retire", ignoreCase = true)) {
                        PlugpagEventEmitter.emitPaymentEvent(1030.0, "Retire o cartão")
                      } else {
                        PlugpagEventEmitter.emitPaymentEvent(1001.0, message.ifEmpty { "Cartão detectado" })
                      }
                    }
                    message.contains("processa", ignoreCase = true) ||
                    message.contains("process", ignoreCase = true) -> {
                      PlugpagEventEmitter.emitPaymentEvent(1020.0, message.ifEmpty { "Processando transação..." })
                    }
                    message.contains("conecta", ignoreCase = true) ||
                    message.contains("connect", ignoreCase = true) -> {
                      PlugpagEventEmitter.emitPaymentEvent(1021.0, message.ifEmpty { "Conectando à rede..." })
                    }
                    message.contains("envian", ignoreCase = true) ||
                    message.contains("send", ignoreCase = true) -> {
                      PlugpagEventEmitter.emitPaymentEvent(1022.0, message.ifEmpty { "Enviando dados..." })
                    }
                    message.contains("aguard", ignoreCase = true) ||
                    message.contains("wait", ignoreCase = true) -> {
                      PlugpagEventEmitter.emitPaymentEvent(1023.0, message.ifEmpty { "Aguardando resposta..." })
                    }
                    message.contains("aprovad", ignoreCase = true) ||
                    message.contains("aprovad", ignoreCase = true) -> {
                      emitPaymentEvent(1031.0, "Transação aprovada")
                    }
                    message.contains("negad", ignoreCase = true) ||
                    message.contains("denied", ignoreCase = true) ||
                    message.contains("recusad", ignoreCase = true) -> {
                      emitPaymentEvent(1032.0, "Transação negada")
                    }
                    else -> {
                      if (message.isNotEmpty()) {
                        emitPaymentEvent(1020.0, message)
                      }
                    }
                  }
                }
              }
            }
          })
          
          // Emit initial event
          PlugpagEventEmitter.emitPaymentEvent(1004.0, "Aguardando cartão...")
          
          val result = plugPag.doPayment(plugPagPaymentData)
          
          // Clear event listener after payment with a no-op listener
          try {
            plugPag.setEventListener(object : PlugPagEventListener {
              override fun onEvent(plugPagEventData: PlugPagEventData) {
                // No-op listener to clear events
              }
            })
          } catch (e: Exception) {
            Log.w(TAG, "Could not clear event listener", e)
          }
          
          val errorCode = when (result.result) {
            PlugPag.RET_OK -> ErrorCode.OK
            PlugPag.OPERATION_ABORTED -> ErrorCode.OPERATION_ABORTED
            PlugPag.AUTHENTICATION_FAILED -> ErrorCode.AUTHENTICATION_FAILED
            PlugPag.COMMUNICATION_ERROR -> ErrorCode.COMMUNICATION_ERROR
            PlugPag.NO_PRINTER_DEVICE -> ErrorCode.NO_PRINTER_DEVICE
            PlugPag.NO_TRANSACTION_DATA -> ErrorCode.NO_TRANSACTION_DATA
            else -> ErrorCode.COMMUNICATION_ERROR
          }
          
          // Emit final event based on result
          if (errorCode == ErrorCode.OK) {
            PlugpagEventEmitter.emitPaymentEvent(1031.0, "Transação aprovada")
          } else {
            PlugpagEventEmitter.emitPaymentEvent(1032.0, "Transação negada")
          }
          
          PlugpagTransactionResult(
            result = errorCode,
            errorCode = result.errorCode ?: "",
            message = result.message ?: "",
            transactionCode = result.transactionCode ?: "",
            transactionId = result.transactionId ?: "",
            hostNsu = result.hostNsu ?: "",
            date = result.date ?: "",
            time = result.time ?: "",
            cardBrand = result.cardBrand ?: "",
            bin = result.bin ?: "",
            holder = result.holder ?: "",
            userReference = result.userReference ?: "",
            terminalSerialNumber = result.terminalSerialNumber ?: "",
            amount = result.amount ?: "",
            availableBalance = result.availableBalance ?: "",
            cardApplication = result.cardApplication ?: "",
            label = result.label ?: "",
            holderName = result.holderName ?: "",
            extendedHolderName = result.extendedHolderName ?: ""
          )
        } catch (e: Exception) {
          Log.e(TAG, "Error processing payment with events", e)
          throw Exception("PAYMENT_WITH_EVENTS_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun refundPayment(
    transactionCode: String,
    transactionId: String,
    printReceipt: Boolean
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          
          val plugPagVoidData = PlugPagVoidData(
            transactionCode,
            transactionId,
            printReceipt
          )
          
          val result = plugPag.voidPayment(plugPagVoidData)
          
          val errorCode = when (result.result) {
            PlugPag.RET_OK -> ErrorCode.OK
            PlugPag.OPERATION_ABORTED -> ErrorCode.OPERATION_ABORTED
            PlugPag.AUTHENTICATION_FAILED -> ErrorCode.AUTHENTICATION_FAILED
            PlugPag.COMMUNICATION_ERROR -> ErrorCode.COMMUNICATION_ERROR
            PlugPag.NO_PRINTER_DEVICE -> ErrorCode.NO_PRINTER_DEVICE
            PlugPag.NO_TRANSACTION_DATA -> ErrorCode.NO_TRANSACTION_DATA
            else -> ErrorCode.COMMUNICATION_ERROR
          }
          
          PlugpagTransactionResult(
            result = errorCode,
            errorCode = result.errorCode ?: "",
            message = result.message ?: "",
            transactionCode = result.transactionCode ?: "",
            transactionId = result.transactionId ?: "",
            hostNsu = result.hostNsu ?: "",
            date = result.date ?: "",
            time = result.time ?: "",
            cardBrand = result.cardBrand ?: "",
            bin = result.bin ?: "",
            holder = result.holder ?: "",
            userReference = result.userReference ?: "",
            terminalSerialNumber = result.terminalSerialNumber ?: "",
            amount = result.amount ?: "",
            availableBalance = result.availableBalance ?: "",
            cardApplication = result.cardApplication ?: "",
            label = result.label ?: "",
            holderName = result.holderName ?: "",
            extendedHolderName = result.extendedHolderName ?: ""
          )
        } catch (e: Exception) {
          Log.e(TAG, "Error processing refund payment", e)
          throw Exception("REFUND_PAYMENT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun doAbort(): Promise<PlugpagAbortResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          val result = plugPag.abort()
          
          PlugpagAbortResult(
            result = result.result == PlugPag.RET_OK
          )
        } catch (e: Exception) {
          Log.e(TAG, "Error aborting operation", e)
          throw Exception("ABORT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun print(filePath: String): Promise<Unit> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          val printerData = PlugPagPrinterData(filePath, 4, 0)
          
          plugPag.setPrinterListener(object : PlugPagPrinterListener {
            override fun onError(result: PlugPagPrintResult) {
              Log.e(TAG, "Print error: ${result.message}")
            }
            
            override fun onSuccess(result: PlugPagPrintResult) {
              Log.d(TAG, "Print success")
            }
          })
          
          plugPag.printFromFile(printerData)
          Unit
        } catch (e: Exception) {
          Log.e(TAG, "Error printing", e)
          throw Exception("PRINT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun reprintCustomerReceipt(): Promise<Unit> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          plugPag.reprintCustomerReceipt()
          Unit
        } catch (e: Exception) {
          Log.e(TAG, "Error reprinting customer receipt", e)
          throw Exception("REPRINT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  private fun initializePlugPag() {
    if (!::plugPag.isInitialized) {
      val context = NitroModules.applicationContext as Context
      plugPag = PlugPag(context)
    }
  }
  
  private fun emitPaymentEvent(code: Double, message: String) {
    try {
      Log.d(TAG, "Payment Event - Code: $code, Message: $message")
      
      // Emit event using the dedicated event emitter
      PlugpagEventEmitter.emitPaymentEvent(code, message)
    } catch (e: Exception) {
      Log.e(TAG, "Error emitting payment event", e)
    }
  }
}
