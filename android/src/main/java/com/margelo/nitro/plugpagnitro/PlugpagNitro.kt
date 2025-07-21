package com.margelo.nitro.plugpagnitro

import android.content.Context
import android.os.Build
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagAppIdentification
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
  
  // Lazy initialization for better performance
  private val plugPag: PlugPag by lazy { 
    PlugPag(hybridContext.context).also { setAppIdentification(it) }
  }
  
  // Use SupervisorJob for better error handling
  private val coroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
  
  // Thread-safe password counter
  private var countPassword = 0
  private val passwordMutex = Mutex()
  
  // Cached constants for better performance
  private val cachedConstants: PlugpagConstants by lazy { createConstants() }
  
  // Memory management
  override val memorySize: Long
    get() = ESTIMATED_MEMORY_SIZE

  companion object {
    private const val TAG = "PlugpagNitro"
    private const val EVENT_PAYMENTS = "eventPayments"
    private const val UNKNOWN_SERIAL = "UNKNOWN"
    private const val DEFAULT_USER_REFERENCE = ""
    private const val ESTIMATED_MEMORY_SIZE = 1024L * 8 // 8KB estimated
    
    // Password display patterns for better performance
    private val PASSWORD_PATTERNS = arrayOf(
      "Senha:",
      "Senha: *",
      "Senha: **", 
      "Senha: ***",
      "Senha: ****",
      "Senha: *****",
      "Senha: ******"
    )
  }

  override fun getConstants(): PlugpagConstants = cachedConstants

  override fun getTerminalSerialNumber(): String {
    return try {
      Build.SERIAL?.takeIf { it.isNotBlank() } ?: UNKNOWN_SERIAL
    } catch (e: SecurityException) {
      Log.w(TAG, "Unable to access device serial number", e)
      UNKNOWN_SERIAL
    } catch (e: Exception) {
      Log.e(TAG, "Error getting terminal serial number", e)
      UNKNOWN_SERIAL
    }
  }

  override fun initializeAndActivatePinPad(
    activationCode: String, 
    promise: Promise<PlugpagInitializationResult>
  ) {
    if (activationCode.isBlank()) {
      promise.reject("INVALID_ACTIVATION_CODE", "Activation code cannot be empty", null)
      return
    }
    
    coroutineScope.launch {
      try {
        val activationData = PlugPagActivationData(activationCode)
        val result = plugPag.initializeAndActivatePinpad(activationData)
        
        val response = PlugpagInitializationResult(
          result = result.result,
          errorCode = result.errorCode,
          errorMessage = result.errorMessage
        )
        
        withContext(Dispatchers.Main) {
          promise.resolve(response)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error initializing pin pad", e)
        withContext(Dispatchers.Main) {
          promise.reject("INITIALIZATION_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  // Optimized with flattened parameters following Nitro performance tips
  override fun doPayment(
    amount: Double,
    type: Double,
    installmentType: Double,
    installments: Double,
    printReceipt: Boolean,
    userReference: String,
    promise: Promise<PlugpagTransactionResult>
  ) {
    // Input validation
    if (amount <= 0) {
      promise.reject("INVALID_AMOUNT", "Amount must be greater than 0", null)
      return
    }
    
    coroutineScope.launch {
      try {
        setupPaymentEventListener()
        
        val plugPagPaymentData = PlugPagPaymentData(
          type.toInt(),
          amount.toInt(),
          installmentType.toInt(),
          installments.toInt(),
          userReference.takeIf { it.isNotBlank() } ?: DEFAULT_USER_REFERENCE,
          printReceipt
        )
        
        val result = plugPag.doPayment(plugPagPaymentData)
        val response = createTransactionResult(result)
        
        withContext(Dispatchers.Main) {
          promise.resolve(response)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error processing payment", e)
        withContext(Dispatchers.Main) {
          promise.reject("PAYMENT_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  // Optimized with flattened parameters following Nitro performance tips  
  override fun voidPayment(
    transactionCode: String,
    transactionId: String,
    printReceipt: Boolean,
    promise: Promise<PlugpagTransactionResult>
  ) {
    // Input validation
    if (transactionCode.isBlank() || transactionId.isBlank()) {
      promise.reject("INVALID_TRANSACTION_DATA", "Transaction code and ID cannot be empty", null)
      return
    }
    
    coroutineScope.launch {
      try {
        setupPaymentEventListener()
        
        val plugPagVoidData = PlugPagVoidData(transactionCode, transactionId, printReceipt)
        val result = plugPag.voidPayment(plugPagVoidData)
        val response = createTransactionResult(result)
        
        withContext(Dispatchers.Main) {
          promise.resolve(response)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error processing void payment", e)
        withContext(Dispatchers.Main) {
          promise.reject("VOID_PAYMENT_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  override fun doAbort(promise: Promise<PlugpagAbortResult>) {
    coroutineScope.launch {
      try {
        val result = plugPag.abort()
        val response = PlugpagAbortResult(result = result.result == PlugPag.RET_OK)
        
        withContext(Dispatchers.Main) {
          promise.resolve(response)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error aborting transaction", e)
        withContext(Dispatchers.Main) {
          promise.reject("ABORT_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  override fun readNFCCard(promise: Promise<PlugpagNFCResult>) {
    coroutineScope.launch {
      try {
        val result = plugPag.readNFCCard()
        val response = PlugpagNFCResult(uid = result.uid ?: "")
        
        withContext(Dispatchers.Main) {
          promise.resolve(response)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error reading NFC card", e)
        withContext(Dispatchers.Main) {
          promise.reject("NFC_READ_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  override fun print(filePath: String, promise: Promise<Unit>) {
    if (filePath.isBlank()) {
      promise.reject("INVALID_FILE_PATH", "File path cannot be empty", null)
      return
    }
    
    coroutineScope.launch {
      try {
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
        
        withContext(Dispatchers.Main) {
          promise.resolve(Unit)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error printing", e)
        withContext(Dispatchers.Main) {
          promise.reject("PRINT_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  override fun reprintCustomerReceipt(promise: Promise<Unit>) {
    coroutineScope.launch {
      try {
        plugPag.reprintCustomerReceipt()
        
        withContext(Dispatchers.Main) {
          promise.resolve(Unit)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error reprinting receipt", e)
        withContext(Dispatchers.Main) {
          promise.reject("REPRINT_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }
  }

  // Private helper methods for better code organization
  private fun createConstants(): PlugpagConstants {
    return PlugpagConstants(
      // Payment Types
      PAYMENT_CREDITO = PlugPag.TYPE_CREDITO,
      PAYMENT_DEBITO = PlugPag.TYPE_DEBITO,
      PAYMENT_VOUCHER = PlugPag.TYPE_VOUCHER,
      PAYMENT_PIX = PlugPag.TYPE_PIX,
      
      // Installment Types
      INSTALLMENT_TYPE_A_VISTA = PlugPag.INSTALLMENT_TYPE_A_VISTA,
      INSTALLMENT_TYPE_PARC_VENDEDOR = PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR,
      INSTALLMENT_TYPE_PARC_COMPRADOR = PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR,
      
      // Error Codes
      ERROR_CODE_OK = PlugPag.ERROR_CODE_OK,
      OPERATION_ABORTED = PlugPag.OPERATION_ABORTED,
      AUTHENTICATION_FAILED = PlugPag.AUTHENTICATION_FAILED,
      COMMUNICATION_ERROR = PlugPag.COMMUNICATION_ERROR,
      NO_PRINTER_DEVICE = PlugPag.NO_PRINTER_DEVICE,
      NO_TRANSACTION_DATA = PlugPag.NO_TRANSACTION_DATA,
      
      // Actions
      ACTION_POST_OPERATION = PlugPag.ACTION_POST_OPERATION,
      ACTION_PRE_OPERATION = PlugPag.ACTION_PRE_OPERATION,
      ACTION_UPDATE = PlugPag.ACTION_UPDATE
    )
  }

  private fun setAppIdentification(plugPagInstance: PlugPag = plugPag) {
    try {
      val packageInfo = hybridContext.context.packageManager.getPackageInfo(
        hybridContext.context.packageName, 0
      )
      val appIdentification = PlugPagAppIdentification(
        "PlugpagNitro",
        packageInfo.versionName ?: "1.0.0"
      )
      plugPagInstance.appIdentification = appIdentification
    } catch (e: Exception) {
      Log.e(TAG, "Error setting app identification", e)
    }
  }

  private fun setupPaymentEventListener() {
    plugPag.setEventListener(object : PlugPagEventListener {
      override fun onEvent(plugPagEventData: PlugPagEventData) {
        val messageCard = plugPagEventData.customMessage ?: ""
        val code = plugPagEventData.eventCode
        
        val params = Arguments.createMap().apply {
          putInt("code", code)
        }
        
        coroutineScope.launch {
          when (code) {
            PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> {
              passwordMutex.withLock {
                countPassword = (countPassword + 1).coerceAtMost(PASSWORD_PATTERNS.size - 1)
                params.putString("message", PASSWORD_PATTERNS[countPassword])
              }
            }
            PlugPagEventData.EVENT_CODE_NO_PASSWORD -> {
              passwordMutex.withLock {
                countPassword = 0
                params.putString("message", PASSWORD_PATTERNS[0])
              }
            }
            else -> {
              params.putString("message", messageCard)
            }
          }
          
          withContext(Dispatchers.Main) {
            emitEvent(EVENT_PAYMENTS, params)
          }
        }
      }
    })
  }

  private fun createTransactionResult(result: PlugPagTransactionResult): PlugpagTransactionResult {
    return PlugpagTransactionResult(
      result = result.result,
      errorCode = result.errorCode,
      message = result.message,
      transactionCode = result.transactionCode,
      transactionId = result.transactionId,
      hostNsu = result.hostNsu,
      date = result.date,
      time = result.time,
      cardBrand = result.cardBrand,
      bin = result.bin,
      holder = result.holder,
      userReference = result.userReference,
      terminalSerialNumber = result.terminalSerialNumber,
      amount = result.amount,
      availableBalance = result.availableBalance,
      cardApplication = result.cardApplication,
      label = result.label,
      holderName = result.holderName,
      extendedHolderName = result.extendedHolderName
    )
  }

  private fun emitEvent(eventName: String, params: WritableMap) {
    try {
      val context = hybridContext.context
      if (context is ReactApplicationContext) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, params)
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error emitting event $eventName", e)
    }
  }
}
