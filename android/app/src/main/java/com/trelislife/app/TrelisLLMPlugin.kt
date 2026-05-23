package com.trelislife.app

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File
import java.io.FileOutputStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.google.ai.edge.litertlm.LlmInference

@CapacitorPlugin(name = "TrelisLLM")
class TrelisLLMPlugin : Plugin() {

    private var llmInference: LlmInference? = null

    @PluginMethod
    fun initializeModel(call: PluginCall) {
        val modelPath = call.getString("modelPath")
        if (modelPath == null) {
            call.reject("modelPath option is required")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val fileName = File(modelPath).name
                val targetFile = File(context.filesDir, fileName)

                // Copy from bundled Android assets if it doesn't exist yet
                if (!targetFile.exists() || targetFile.length() == 0L) {
                    val assetPath = if (modelPath.startsWith("public/")) modelPath else "public/$modelPath"
                    
                    val inputStream = context.assets.open(assetPath)
                    val outputStream = FileOutputStream(targetFile)
                    val buffer = ByteArray(8192)
                    var length: Int
                    while (inputStream.read(buffer).also { length = it } > 0) {
                        outputStream.write(buffer, 0, length)
                    }
                    outputStream.flush()
                    outputStream.close()
                    inputStream.close()
                }

                // Instantiate LlmInference using absolute path of copied file
                llmInference = LlmInference(targetFile.absolutePath)

                withContext(Dispatchers.Main) {
                    call.resolve()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Failed to initialize LlmInference from bundled asset: " + e.localizedMessage, e)
                }
            }
        }
    }

    @PluginMethod
    fun generateResponse(call: PluginCall) {
        val prompt = call.getString("prompt")
        val maxTokens = call.getInt("maxTokens") ?: 512

        if (prompt == null) {
            call.reject("prompt option is required")
            return
        }

        val inference = llmInference
        if (inference == null) {
            call.reject("Model is not initialized. Please call initializeModel first.")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val responseText = inference.generateResponse(prompt)
                
                val ret = JSObject()
                ret.put("text", responseText)

                withContext(Dispatchers.Main) {
                    call.resolve(ret)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Inference failed: " + e.localizedMessage, e)
                }
            }
        }
    }
}
