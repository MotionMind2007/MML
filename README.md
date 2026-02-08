📑 Project Blueprint: Motion Mind Local (v1.0.0)
১. মূল উদ্দেশ্য (Core Purpose)
একটি সম্পূর্ণ অফলাইন এবং প্রাইভেট লোকাল এআই চ্যাট অ্যাপ্লিকেশন যা ফোনের মেমোরি ব্যবহার করে .gguf ফরম্যাটের লার্জ ল্যাঙ্গুয়েজ মডেল (LLM) রান করে।

২. টেকনিক্যাল আর্কিটেকচার (Technical Stack)
Framework: Expo SDK 54 (New Architecture Enabled).

Engine: llama.rn (Native binding for llama.cpp).

Storage: expo-file-system (Model caching & chat history).

UI: React Native (Custom styles with SafeAreaView & KeyboardAvoidingView).

৩. লজিক ফ্লো এবং মডিউলসমূহ (Core Logic)
ক. মডেল ম্যানেজমেন্ট (Model Lifecycle)
Auto-load: অ্যাপ ওপেন হলে cacheDirectory/models/ ফোল্ডারে কোনো .gguf ফাইল থাকলে তা অটোমেটিক initLlama দিয়ে লোড হয়।

Pick & Prepare: DocumentPicker দিয়ে ফাইল সিলেক্ট করার পর পুরনো মেমোরি (context.release()) খালি করে ক্যাশে ক্লিয়ার করা হয় এবং নতুন ফাইল কপি করে লোড করা হয়।

RAM Safety: n_ctx: 512 ব্যবহার করা হয়েছে যাতে বড় মডেলে ফোন ক্র্যাশ না করে।

খ. চ্যাট লজিক (Chat & Context)
Context Sliding Window: এআই যেন আগের কথা মনে রাখতে পারে, তাই শেষ ৬টি মেসেজ (slice(0, 6)) প্রম্পটের সাথে পাঠানো হয়।

System Prompt: ইউজারের দেওয়া কাস্টম নির্দেশনার সাথে একটি hiddenConstraint (সংক্ষিপ্ত উত্তরের জন্য) যোগ করে এআইকে কন্ট্রোল করা হয়।

Streaming UI: এআই-এর প্রতিটি টোকেন জেনারেট হওয়ার সাথে সাথে fullResponse আপডেট হয়, যা ইউজারকে রিয়েল-টাইম টাইপিং অভিজ্ঞতা দেয়।

গ. ডাটা স্টোরেজ (Persistence)
chat_history.json ফাইলে শেষ ২০টি মেসেজ সেভ থাকে, যা অ্যাপ পুনরায় চালু করলে লোড হয়।