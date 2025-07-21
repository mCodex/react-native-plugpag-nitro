package com.margelo.nitro.plugpagnitro

import android.content.Context
import android.os.Build
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.margelo.nitro.core.Promise
import com.margelo.nitro.NitroModules
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInitializationResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPaymentData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagVoidData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagAbortResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagNearFieldCardData

@DoNotStrip
class PlugpagNitro : HybridPlugpagNitroSpec() {
  
  private lateinit var plugPag: PlugPag
  private var countPassword = 0
  private var messageCard = ""
  
  // UI Configuration
  private var showDefaultUI = true
  private var allowCancellation = true
  private var defaultTimeoutSeconds = 60
  private var customMessages = mutableMapOf<String, String>()
  
  // Cancellation management
  private val activeCancellationTokens = mutableSetOf<String>()
  private val cancellationCallbacks = mutableMapOf<String, () -> Unit>()

  companion object {
    private const val TAG = "PlugpagNitro"
    private const val EVENT_PAYMENTS = "eventPayments"
    private const val EVENT_UI_STATE = "eventUIState"
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
      val context = NitroModules.applicationContext 
        ?: return "UNKNOWN"
      
      // Use a more modern approach instead of deprecated Build.SERIAL
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
          
          PlugpagInitializationResult(
            result = result.result.toDouble(),
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
    type: Double,
    installmentType: Double,
    installments: Double,
    printReceipt: Boolean,
    userReference: String
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          setupPaymentEventListener()
          
          val plugPagPaymentData = PlugPagPaymentData(
            type.toInt(),
            amount.toInt(),
            installmentType.toInt(),
            installments.toInt(),
            userReference,
            printReceipt
          )
          
          val result = plugPag.doPayment(plugPagPaymentData)
          
          PlugpagTransactionResult(
            result = result.result?.toDouble() ?: 0.0,
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

  override fun voidPayment(
    transactionCode: String,
    transactionId: String,
    printReceipt: Boolean
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          setupPaymentEventListener()
          
          val plugPagVoidData = PlugPagVoidData(
            transactionCode,
            transactionId,
            printReceipt
          )
          
          val result = plugPag.voidPayment(plugPagVoidData)
          
          PlugpagTransactionResult(
            result = result.result?.toDouble() ?: 0.0,
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
          Log.e(TAG, "Error processing void payment", e)
          throw Exception("VOID_PAYMENT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun doPaymentWithUI(
    amount: Double,
    type: Double,
    installmentType: Double,
    installments: Double,
    printReceipt: Boolean,
    userReference: String,
    showDefaultUI: Boolean,
    allowCancellation: Boolean,
    timeoutSeconds: Double,
    cancellationToken: String
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          
          // Register cancellation token
          if (allowCancellation) {
            activeCancellationTokens.add(cancellationToken)
          }
          
          // Setup UI configuration for this payment
          val originalShowDefaultUI = this@PlugpagNitro.showDefaultUI
          val originalAllowCancellation = this@PlugpagNitro.allowCancellation
          
          this@PlugpagNitro.showDefaultUI = showDefaultUI
          this@PlugpagNitro.allowCancellation = allowCancellation
          
          try {
            setupPaymentEventListener()
            
            // Emit UI state change
            emitUIStateEvent("PAYMENT_STARTED", cancellationToken, allowCancellation)
            
            val plugPagPaymentData = PlugPagPaymentData(
              type.toInt(),
              amount.toInt(),
              installmentType.toInt(),
              installments.toInt(),
              userReference,
              printReceipt
            )
            
            // Set up cancellation callback
            if (allowCancellation) {
              cancellationCallbacks[cancellationToken] = {
                try {
                  plugPag.abort()
                  emitUIStateEvent("PAYMENT_CANCELLED", cancellationToken, allowCancellation)
                } catch (e: Exception) {
                  Log.e(TAG, "Error cancelling payment", e)
                }
              }
            }
            
            val result = plugPag.doPayment(plugPagPaymentData)
            
            // Clean up cancellation token
            activeCancellationTokens.remove(cancellationToken)
            cancellationCallbacks.remove(cancellationToken)
            
            emitUIStateEvent("PAYMENT_COMPLETED", cancellationToken, allowCancellation)
            
            PlugpagTransactionResult(
              result = result.result?.toDouble() ?: 0.0,
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
          } finally {
            // Restore original UI settings
            this@PlugpagNitro.showDefaultUI = originalShowDefaultUI
            this@PlugpagNitro.allowCancellation = originalAllowCancellation
          }
        } catch (e: Exception) {
          // Clean up on error
          activeCancellationTokens.remove(cancellationToken)
          cancellationCallbacks.remove(cancellationToken)
          emitUIStateEvent("PAYMENT_ERROR", cancellationToken, allowCancellation)
          
          Log.e(TAG, "Error processing payment with UI", e)
          throw Exception("PAYMENT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun cancelPayment(cancellationToken: String): Promise<PlugpagCancellationResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          if (!activeCancellationTokens.contains(cancellationToken)) {
            PlugpagCancellationResult(
              success = false,
              message = "No active operation with this token"
            )
          } else {
            val callback = cancellationCallbacks[cancellationToken]
            if (callback != null) {
              callback.invoke()
              activeCancellationTokens.remove(cancellationToken)
              cancellationCallbacks.remove(cancellationToken)
              
              PlugpagCancellationResult(
                success = true,
                message = "Operation cancelled by user"
              )
            } else {
              PlugpagCancellationResult(
                success = false,
                message = "No cancellation callback available"
              )
            }
          }
        } catch (e: Exception) {
          Log.e(TAG, "Error cancelling payment", e)
          PlugpagCancellationResult(
            success = false,
            message = "Error during cancellation: ${e.message}"
          )
        }
      }
    }
  }

  override fun configureUI(
    showDefaultUI: Boolean,
    customMessages: String,
    allowCancellation: Boolean,
    timeoutSeconds: Double
  ): Promise<Boolean> {
    return Promise.async {
      try {
        this@PlugpagNitro.showDefaultUI = showDefaultUI
        this@PlugpagNitro.allowCancellation = allowCancellation
        this@PlugpagNitro.defaultTimeoutSeconds = timeoutSeconds.toInt()
        
        // Parse custom messages JSON
        try {
          // Simple JSON parsing for custom messages
          // In a real implementation, you might want to use a proper JSON library
          this@PlugpagNitro.customMessages.clear()
          if (customMessages.isNotEmpty() && customMessages != "{}") {
            // Basic parsing - in production, use proper JSON parsing
            Log.d(TAG, "Custom messages configured: $customMessages")
          }
        } catch (e: Exception) {
          Log.w(TAG, "Error parsing custom messages", e)
        }
        
        Log.d(TAG, "UI configured - showDefaultUI: $showDefaultUI, allowCancellation: $allowCancellation")
        true
      } catch (e: Exception) {
        Log.e(TAG, "Error configuring UI", e)
        false
      }
    }
  }

  override fun doAbort(): Promise<PlugpagAbortResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          val result = plugPag.abort()
          PlugpagAbortResult(result = result.result == PlugPag.RET_OK)
        } catch (e: Exception) {
          Log.e(TAG, "Error aborting transaction", e)
          throw Exception("ABORT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  override fun readNFCCard(): Promise<PlugpagNFCResult> {
    return Promise.async {
      withContext(Dispatchers.IO) {
        try {
          initializePlugPag()
          // Note: PlugPag wrapper doesn't have a direct readNFCCard method
          // This would need to be implemented based on available PlugPag NFC methods
          // For now, returning a placeholder result
          Log.w(TAG, "NFC card reading not yet implemented - PlugPag wrapper method needed")
          PlugpagNFCResult(uid = "")
        } catch (e: Exception) {
          Log.e(TAG, "Error reading NFC card", e)
          throw Exception("NFC_READ_ERROR: ${e.message ?: "Unknown error"}")
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
          Log.e(TAG, "Error reprinting receipt", e)
          throw Exception("REPRINT_ERROR: ${e.message ?: "Unknown error"}")
        }
      }
    }
  }

  private fun initializePlugPag() {
    if (!this::plugPag.isInitialized) {
      val context = NitroModules.applicationContext 
        ?: throw IllegalStateException("Context not available for PlugPag initialization")
      
      plugPag = PlugPag(context)
    }
  }

  private fun setupPaymentEventListener() {
    plugPag.setEventListener(object : PlugPagEventListener {
      override fun onEvent(plugPagEventData: PlugPagEventData) {
        messageCard = plugPagEventData.customMessage ?: ""
        val code = plugPagEventData.eventCode
        
        val params = Arguments.createMap().apply {
          putInt("code", code)
        }
        
        when (code) {
          PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> {
            countPassword++
            val passwordDisplay = when (countPassword) {
              0 -> "Senha:"
              1 -> "Senha: *"
              2 -> "Senha: **"
              3 -> "Senha: ***"
              4 -> "Senha: ****"
              5 -> "Senha: *****"
              6 -> "Senha: ******"
              else -> "Senha: ******"
            }
            params.putString("message", passwordDisplay)
          }
          PlugPagEventData.EVENT_CODE_NO_PASSWORD -> {
            countPassword = 0
            params.putString("message", "Senha:")
          }
          else -> {
            params.putString("message", messageCard)
          }
        }
        
        emitEvent(EVENT_PAYMENTS, params)
      }
    })
  }

  private fun emitEvent(eventName: String, params: WritableMap) {
    try {
      val context = NitroModules.applicationContext
      if (context is ReactApplicationContext) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, params)
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error emitting event $eventName", e)
    }
  }

  private fun emitUIStateEvent(state: String, token: String, cancellable: Boolean) {
    try {
      val params = Arguments.createMap().apply {
        putString("state", state)
        putString("token", token)
        putBoolean("cancellable", cancellable)
        putDouble("timestamp", System.currentTimeMillis().toDouble())
      }
      
      emitEvent("eventUIState", params)
    } catch (e: Exception) {
      Log.e(TAG, "Error emitting UI state event", e)
    }
  }
}
