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
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagVoidData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagNearFieldCardData

@DoNotStrip
class PlugpagNitro : HybridPlugpagNitroSpec() {
  
  private lateinit var plugPag: PlugPag
  private lateinit var taskManager: TaskManager
  private lateinit var uiStateManager: UIStateManager
  private lateinit var paymentEventHandler: PaymentEventHandler

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
      taskManager.executeSecureTask(TaskManager.TaskType.INITIALIZATION, TaskManager.TaskPriority.HIGH) {
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
      taskManager.executeSecureTask(TaskManager.TaskType.PAYMENT) {
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
  }

  override fun voidPayment(
    transactionCode: String,
    transactionId: String,
    printReceipt: Boolean
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.VOID_PAYMENT, TaskManager.TaskPriority.HIGH) {
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
  }

  override fun doPaymentWithUI(
    amount: Int,
    type: Int,
    installmentType: Int,
    installments: Int,
    printReceipt: Boolean,
    userReference: String,
    showDefaultUI: Boolean,
    allowCancellation: Boolean,
    timeoutSeconds: Int,
    cancellationToken: String
  ): Promise<PlugpagTransactionResult> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.PAYMENT) {
        withContext(Dispatchers.IO) {
          try {
            initializePlugPag()
            
            // Setup UI configuration for this payment
            val originalShowDefaultUI = uiStateManager.getShowDefaultUI()
            val originalAllowCancellation = uiStateManager.getAllowCancellation()
            
            uiStateManager.configureUI(
              showDefaultUI = showDefaultUI,
              allowCancellation = allowCancellation,
              timeoutSeconds = timeoutSeconds.toInt()
            )
            
            // Register cancellation token
            if (allowCancellation) {
              uiStateManager.registerCancellationToken(cancellationToken) {
                try {
                  plugPag.abort()
                  uiStateManager.emitUIStateEvent("PAYMENT_CANCELLED", cancellationToken, allowCancellation)
                } catch (e: Exception) {
                  Log.e(TAG, "Error cancelling payment", e)
                }
              }
            }
            
            try {
              setupPaymentEventListener()
              
              // Emit UI state change
              uiStateManager.emitUIStateEvent("PAYMENT_STARTED", cancellationToken, allowCancellation)
              
              val plugPagPaymentData = PlugPagPaymentData(
                type.toInt(),
                amount.toInt(),
                installmentType.toInt(),
                installments.toInt(),
                userReference,
                printReceipt
              )
              
              val result = plugPag.doPayment(plugPagPaymentData)
              
              // Clean up cancellation token
              uiStateManager.cleanupCancellationToken(cancellationToken)
              
              uiStateManager.emitUIStateEvent("PAYMENT_COMPLETED", cancellationToken, allowCancellation)
              
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
              uiStateManager.configureUI(
                showDefaultUI = originalShowDefaultUI,
                allowCancellation = originalAllowCancellation
              )
            }
          } catch (e: Exception) {
            // Clean up on error
            uiStateManager.cleanupCancellationToken(cancellationToken)
            uiStateManager.emitUIStateEvent("PAYMENT_ERROR", cancellationToken, allowCancellation)
            
            Log.e(TAG, "Error processing payment with UI", e)
            throw Exception("PAYMENT_ERROR: ${e.message ?: "Unknown error"}")
          }
        }
      }
    }
  }

  override fun cancelPayment(cancellationToken: String): Promise<PlugpagCancellationResult> {
    return Promise.async {
      try {
        val success = uiStateManager.executeCancellation(cancellationToken)
        
        PlugpagCancellationResult(
          success = success,
          message = if (success) "Payment cancelled successfully" else "Failed to cancel payment or token not found"
        )
      } catch (e: Exception) {
        Log.e(TAG, "Error cancelling payment", e)
        PlugpagCancellationResult(
          success = false,
          message = "CANCELLATION_ERROR: ${e.message ?: "Unknown error"}"
        )
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
        // Parse custom messages JSON if provided
        val messagesMap = if (customMessages.isNotBlank()) {
          try {
            parseCustomMessagesJson(customMessages)
          } catch (e: Exception) {
            Log.e(TAG, "Error parsing custom messages JSON: ${e.message}", e)
            // For payment security, we fail gracefully but log the error
            mapOf<String, String>()
          }
        } else {
          mapOf<String, String>()
        }
        
        uiStateManager.configureUI(
          showDefaultUI = showDefaultUI,
          allowCancellation = allowCancellation,
          timeoutSeconds = timeoutSeconds.toInt(),
          customMessages = messagesMap
        )
        true
      } catch (e: Exception) {
        Log.e(TAG, "Error configuring UI", e)
        false
      }
    }
  }

  override fun doAbort(): Promise<PlugpagAbortResult> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.ABORT, TaskManager.TaskPriority.CRITICAL) {
        withContext(Dispatchers.IO) {
          try {
            val result = plugPag.abort()
            uiStateManager.cleanupAllCancellationTokens()
            
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
  }

  override fun readNFCCard(): Promise<PlugpagNFCResult> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.CONFIGURATION) {
        withContext(Dispatchers.IO) {
          try {
            initializePlugPag()
            
            val cardData = PlugPagNearFieldCardData()
            val result = plugPag.readFromNFCCard(cardData)
            
            // Extract UID from result - typically the first slot contains the card UID
            val uid = if (result.result == PlugPag.NFC_RET_OK && result.slots.isNotEmpty()) {
              // The UID is usually in the first slot as a byte array
              val uidBytes = result.slots[0]["UID"] ?: result.slots[0]["uid"] ?: ByteArray(0)
              if (uidBytes.isNotEmpty()) {
                uidBytes.joinToString("") { "%02X".format(it) }
              } else {
                "UNKNOWN"
              }
            } else {
              "UNKNOWN"
            }
            
            PlugpagNFCResult(
              uid = uid
            )
          } catch (e: Exception) {
            Log.e(TAG, "Error reading NFC card", e)
            throw Exception("NFC_READ_ERROR: ${e.message ?: "Unknown error"}")
          }
        }
      }
    }
  }

  override fun print(filePath: String): Promise<Unit> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.PRINT) {
        withContext(Dispatchers.IO) {
          try {
            val printerData = PlugPagPrinterData(filePath, 4, 0)
            
            plugPag.setPrinterListener(object : PlugPagPrinterListener {
              override fun onError(result: PlugPagPrintResult) {
                Log.e(TAG, "Print error: ${result.message ?: "Print failed"}")
              }
              
              override fun onSuccess(result: PlugPagPrintResult) {
                Log.i(TAG, "Print completed successfully")
              }
            })
            
            plugPag.printFromFile(printerData)
          } catch (e: Exception) {
            Log.e(TAG, "Error printing", e)
            throw Exception("PRINT_ERROR: ${e.message ?: "Unknown error"}")
          }
        }
      }
    }
  }

  override fun reprintCustomerReceipt(): Promise<Unit> {
    return Promise.async {
      taskManager.executeSecureTask(TaskManager.TaskType.PRINT) {
        withContext(Dispatchers.IO) {
          try {
            plugPag.reprintCustomerReceipt()
          } catch (e: Exception) {
            Log.e(TAG, "Error reprinting customer receipt", e)
            throw Exception("REPRINT_ERROR: ${e.message ?: "Unknown error"}")
          }
        }
      }
    }
  }

  /**
   * Initialize PlugPag service and managers
   */
  private fun initializePlugPag() {
    if (!::plugPag.isInitialized) {
      val context = NitroModules.applicationContext as Context
      plugPag = PlugPag(context)
      taskManager = TaskManager(plugPag)
      uiStateManager = UIStateManager()
      paymentEventHandler = PaymentEventHandler(uiStateManager)
    }
  }

  /**
   * Setup payment event listener
   */
  private fun setupPaymentEventListener() {
    plugPag.setEventListener(paymentEventHandler)
  }

  /**
   * Parse custom messages JSON string into a map
   * Supports nested objects for UI state-specific messages
   * 
   * Expected JSON format:
   * {
   *   "insertCard": "Please insert your card",
   *   "approximateCard": "Approximate your card to the reader",
   *   "enterPassword": "Enter your password",
   *   "processing": "Processing transaction...",
   *   "approved": "Transaction approved",
   *   "declined": "Transaction declined",
   *   "cancelled": "Transaction cancelled",
   *   "error": "Transaction error occurred"
   * }
   */
  private fun parseCustomMessagesJson(jsonString: String): Map<String, String> {
    val messagesMap = mutableMapOf<String, String>()
    
    try {
      // Remove whitespace and validate basic JSON structure
      val trimmedJson = jsonString.trim()
      if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
        throw IllegalArgumentException("Invalid JSON format: must be a JSON object")
      }
      
      // Extract content between braces
      val content = trimmedJson.substring(1, trimmedJson.length - 1).trim()
      
      if (content.isEmpty()) {
        return messagesMap
      }
      
      // Split by commas outside of quoted strings
      val pairs = parseJsonPairs(content)
      
      for (pair in pairs) {
        val (key, value) = parseJsonKeyValue(pair)
        
        // Validate message keys for payment security
        if (isValidMessageKey(key)) {
          messagesMap[key] = value
        } else {
          Log.w(TAG, "Ignoring invalid message key: $key")
        }
      }
      
      Log.d(TAG, "Parsed ${messagesMap.size} custom messages")
      
    } catch (e: Exception) {
      Log.e(TAG, "JSON parsing error: ${e.message}", e)
      throw IllegalArgumentException("Failed to parse custom messages JSON: ${e.message}", e)
    }
    
    return messagesMap
  }
  
  /**
   * Parse JSON pairs, handling quoted strings with commas
   */
  private fun parseJsonPairs(content: String): List<String> {
    val pairs = mutableListOf<String>()
    var currentPair = StringBuilder()
    var inQuotes = false
    var escapeNext = false
    
    for (char in content) {
      when {
        escapeNext -> {
          currentPair.append(char)
          escapeNext = false
        }
        char == '\\' -> {
          currentPair.append(char)
          escapeNext = true
        }
        char == '"' -> {
          currentPair.append(char)
          inQuotes = !inQuotes
        }
        char == ',' && !inQuotes -> {
          if (currentPair.isNotEmpty()) {
            pairs.add(currentPair.toString().trim())
            currentPair.clear()
          }
        }
        else -> {
          currentPair.append(char)
        }
      }
    }
    
    if (currentPair.isNotEmpty()) {
      pairs.add(currentPair.toString().trim())
    }
    
    return pairs
  }
  
  /**
   * Parse a single key-value pair from JSON
   */
  private fun parseJsonKeyValue(pair: String): Pair<String, String> {
    val colonIndex = findColonOutsideQuotes(pair)
    if (colonIndex == -1) {
      throw IllegalArgumentException("Invalid key-value pair: $pair")
    }
    
    val keyPart = pair.substring(0, colonIndex).trim()
    val valuePart = pair.substring(colonIndex + 1).trim()
    
    val key = parseJsonString(keyPart)
    val value = parseJsonString(valuePart)
    
    return Pair(key, value)
  }
  
  /**
   * Find colon that's not inside quoted strings
   */
  private fun findColonOutsideQuotes(text: String): Int {
    var inQuotes = false
    var escapeNext = false
    
    for (i in text.indices) {
      val char = text[i]
      when {
        escapeNext -> escapeNext = false
        char == '\\' -> escapeNext = true
        char == '"' -> inQuotes = !inQuotes
        char == ':' && !inQuotes -> return i
      }
    }
    
    return -1
  }
  
  /**
   * Parse a JSON string value, removing quotes and handling escapes
   */
  private fun parseJsonString(text: String): String {
    val trimmed = text.trim()
    
    if (!trimmed.startsWith("\"") || !trimmed.endsWith("\"")) {
      throw IllegalArgumentException("String values must be quoted: $text")
    }
    
    val content = trimmed.substring(1, trimmed.length - 1)
    return unescapeJsonString(content)
  }
  
  /**
   * Unescape JSON string content
   */
  private fun unescapeJsonString(text: String): String {
    val result = StringBuilder()
    var i = 0
    
    while (i < text.length) {
      val char = text[i]
      if (char == '\\' && i + 1 < text.length) {
        when (text[i + 1]) {
          '"' -> result.append('"')
          '\\' -> result.append('\\')
          '/' -> result.append('/')
          'b' -> result.append('\b')
          'f' -> result.append('\u000C')
          'n' -> result.append('\n')
          'r' -> result.append('\r')
          't' -> result.append('\t')
          'u' -> {
            if (i + 5 < text.length) {
              val hexCode = text.substring(i + 2, i + 6)
              try {
                val unicode = hexCode.toInt(16)
                result.append(unicode.toChar())
                i += 4 // Skip the 4 hex digits
              } catch (e: NumberFormatException) {
                throw IllegalArgumentException("Invalid unicode escape: \\u$hexCode")
              }
            } else {
              throw IllegalArgumentException("Incomplete unicode escape")
            }
          }
          else -> throw IllegalArgumentException("Invalid escape sequence: \\${text[i + 1]}")
        }
        i += 2
      } else {
        result.append(char)
        i++
      }
    }
    
    return result.toString()
  }
  
  /**
   * Validate message keys for security - only allow predefined UI message keys
   */
  private fun isValidMessageKey(key: String): Boolean {
    val validKeys = setOf(
      "insertCard",
      "approximateCard", 
      "enterPassword",
      "processing",
      "approved",
      "declined",
      "cancelled",
      "error",
      "waitingCard",
      "waitingPassword",
      "passwordConfirmed",
      "cardDetected",
      "transactionStarted",
      "transactionCompleted",
      "authenticationOk",
      "authenticationFailed",
      "communicationError",
      "timeout"
    )
    
    return validKeys.contains(key)
  }
}
