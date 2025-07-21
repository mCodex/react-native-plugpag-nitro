package com.margelo.nitro.plugpagnitro

import android.util.Log
import kotlinx.coroutines.withTimeout
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag

/**
 * Task Management System for PlugPag Operations
 * Handles secure execution of background tasks with automatic cleanup
 */
class TaskManager(private val plugPag: PlugPag) {
    
    private var currentTask: TaskInfo? = null
    private var isProcessingTask = false
    
    companion object {
        private const val TAG = "PlugpagTaskManager"
        private const val TASK_TIMEOUT_MS = 120000L // 2 minutes
        private const val ABORT_TIMEOUT_MS = 10000L // 10 seconds
    }
    
    data class TaskInfo(
        val id: String,
        val type: TaskType,
        val priority: TaskPriority = TaskPriority.NORMAL
    )
    
    enum class TaskType {
        PAYMENT,
        VOID_PAYMENT,
        PRINT,
        ABORT,
        INITIALIZATION,
        CONFIGURATION
    }
    
    enum class TaskPriority {
        LOW,
        NORMAL,
        HIGH,
        CRITICAL
    }
    
    /**
     * Securely executes a task, handling ongoing operations automatically
     */
    suspend fun <T> executeSecureTask(
        taskType: TaskType,
        priority: TaskPriority = TaskPriority.NORMAL,
        operation: suspend () -> T
    ): T {
        val taskId = generateTaskId()
        
        return try {
            // Handle current task if any
            currentTask?.let { activeTask ->
                if (shouldInterruptTask(activeTask.type, taskType, priority)) {
                    Log.i(TAG, "Interrupting current task ${activeTask.id} for higher priority task")
                    abortCurrentTaskSafely()
                } else {
                    // Wait briefly and retry for lower priority tasks
                    if (priority != TaskPriority.CRITICAL) {
                        Log.w(TAG, "Service busy with ${activeTask.type}. Auto-aborting for new ${taskType} request")
                        abortCurrentTaskSafely()
                    } else {
                        throw Exception("CRITICAL_TASK_BLOCKED: Cannot interrupt critical task ${activeTask.type}")
                    }
                }
            }
            
            // Mark task as current
            val taskInfo = TaskInfo(taskId, taskType, priority)
            currentTask = taskInfo
            isProcessingTask = true
            
            Log.i(TAG, "Starting secure task: $taskId ($taskType)")
            
            // Execute with timeout
            withTimeout(getTaskTimeout(taskType)) {
                operation()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in secure task $taskId: ${e.message}", e)
            throw e
        } finally {
            // Clean up task state
            currentTask = null
            isProcessingTask = false
            Log.i(TAG, "Completed task: $taskId")
        }
    }
    
    /**
     * Safely aborts current ongoing task
     */
    private suspend fun abortCurrentTaskSafely() {
        currentTask?.let { task ->
            try {
                Log.i(TAG, "Auto-aborting current task: ${task.id}")
                
                // Try to abort gracefully
                val abortResult = withTimeout(ABORT_TIMEOUT_MS) {
                    plugPag.abort()
                }
                
                if (abortResult.result != PlugPag.RET_OK) {
                    Log.w(TAG, "Abort returned non-OK result: ${abortResult.result}")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error auto-aborting current task: ${e.message}", e)
                // Continue with cleanup even if abort fails
            }
        }
    }
    
    /**
     * Determines if current task should be interrupted for new task
     */
    private fun shouldInterruptTask(
        currentType: TaskType, 
        newType: TaskType, 
        newPriority: TaskPriority
    ): Boolean {
        return when {
            newPriority == TaskPriority.CRITICAL -> true
            newType == TaskType.ABORT -> true
            currentType == TaskType.CONFIGURATION -> true // Configuration can always be interrupted
            newPriority == TaskPriority.HIGH && currentType != TaskType.PAYMENT -> true
            else -> true // Default: auto-abort for user convenience
        }
    }
    
    /**
     * Gets appropriate timeout for task type
     */
    private fun getTaskTimeout(taskType: TaskType): Long {
        return when (taskType) {
            TaskType.PAYMENT -> TASK_TIMEOUT_MS
            TaskType.VOID_PAYMENT -> 60000L
            TaskType.PRINT -> 30000L
            TaskType.ABORT -> ABORT_TIMEOUT_MS
            TaskType.INITIALIZATION -> 45000L
            TaskType.CONFIGURATION -> 15000L
        }
    }
    
    /**
     * Generates unique task ID
     */
    private fun generateTaskId(): String {
        return "task_${System.currentTimeMillis()}_${(1000..9999).random()}"
    }
    
    /**
     * Checks if service is currently busy
     */
    fun isBusy(): Boolean = isProcessingTask
    
    /**
     * Gets current task type if any
     */
    fun getCurrentTaskType(): TaskType? = currentTask?.type
}
