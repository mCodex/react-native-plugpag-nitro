package com.margelo.nitro.plugpagnitro

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PlugpagNitroPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val eventEmitter = PlugpagEventEmitter(reactContext)
        PlugpagEventEmitter.setInstance(eventEmitter)
        return listOf(eventEmitter)
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }

    companion object {
        init {
            System.loadLibrary("plugpagnitro")
        }
    }
}
