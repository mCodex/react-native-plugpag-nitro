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
}
