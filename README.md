# 🤖 MML (Motion Mind Local) - v1.1.0 (Stable)

**MML (Motion Mind Local)** is a fully offline and private local AI chat application. It runs **.gguf** format Large Language Models (LLMs) directly on your device's processor and memory. No internet or cloud server is required.

---

## ✨ What's New (v1.1.0 Updates)
- 💾 **Persistent Chat History:** Chat history is now automatically saved. Your previous conversations remain even after closing and reopening the app.
- 🔄 **Auto-Loading Engine:** The previously loaded model automatically loads when the app opens.
- 🧹 **Advanced Memory Management:** Improved logic to perfectly clear old memory (RAM) and cache files before loading a new model.
- 🎨 **New Branding:** High-resolution new logo and optimized user interface.
- 📖 **Interactive Guide:** Detailed in-app guide for model downloading and settings.

---

## 🚀 Core Features
- **Fully Offline:** Chat with AI without any internet connection.
- **Privacy First:** Your data and messages never leave your device.
- **Custom Model Support:** Use any GGUF model (Llama, Phi, Gemma, Qwen) based on your device's RAM.
- **Real-time Streaming:** Token-by-token responses for a live typing experience.
- **Smart Context:** AI remembers previous messages and responds intelligently (Sliding Window Context).

---

## 🛠 Technical Architecture
- **Framework:** Expo SDK 54 (New Architecture Enabled)
- **Engine:** `llama.rn` (Native binding for llama.cpp)
- **Storage:** `expo-file-system` (Model caching & chat history management)
- **UI:** React Native with Custom Hooks (`useLlamaManager`, `useChatLayout`)

---

## 📖 Model Setup Guide
Follow these steps for the best performance:

1. **Download:** Download a `.gguf` model from [Hugging Face](https://huggingface.co/models?library=gguf).
2. **Format:** Always try to use **Q4_K_M** quantization (best balance between speed and intelligence).
3. **Recommendations:**
   - 4GB RAM: **Llama-1B** or **Qwen-1.5B**
   - 6GB+ RAM: **Gemma-2B** or **Phi-3-Mini**
   - 12GB+ RAM: **Llama-3-8B**

---

## 🏗 Logic Flow
- **Model Lifecycle:** On app launch, it checks the `models/` folder and auto-loads the model using `initLlama`.
- **Memory Safety:** Uses `context.release()` to manage device RAM and prevent crashes with large models.
- **Persistence:** Last 20 messages are saved in `chat_history.json` file.

---

## 👤 Developer
**MD. Saiful Alom Siam**  
*MML - Bringing AI to your pocket, offline and private.*

---

## 📄 License
This project is created for personal and educational purposes.