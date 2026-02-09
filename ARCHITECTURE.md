# 📂 MML Architecture Blueprint (v1.1.0)

এই প্রজেক্টটি একটি **Modular Hook-based Architecture** ফলো করে তৈরি করা হয়েছে, যাতে UI এবং Business Logic আলাদা থাকে এবং অ্যাপটি দ্রুত পারফর্ম করতে পারে।

---

## 🏗 1. Core Logic (Hooks & Managers)
প্রজেক্টের মূল লজিকগুলো এখন রিইউজেবল হুকস এবং ম্যানেজার ফাইলে বিভক্ত:

* **`useLlamaManager.js`**: এটি এআই ইঞ্জিনের লাইফসাইকেল কন্ট্রোল করে।
    * *Features:* `initLlama` দিয়ে মডেল লোড, অটো-লোড সিস্টেম, এবং নতুন মডেল লোড করার আগে পুরনো মেমোরি (`context.release()`) ক্লিয়ার করা।
* **`useChatLayout.js`**: ইউজার ইন্টারফেসের ডাইনামিক আচরণ নিয়ন্ত্রণ করে।
    * *Features:* কিবোর্ড ভিজিবিলিটি ট্র্যাকিং এবং মেসেজ টাইপ করার সাথে সাথে ইনপুট ফিল্ডের উচ্চতা পরিবর্তন করা।
* **`App.js`**: মেইন এন্ট্রি পয়েন্ট। এখানে গ্লোবাল স্টেট এবং `sendMessage` (Streaming Logic) হ্যান্ডেল করা হয়।

---

## 💾 2. Data & Storage Layer
* **`expo-file-system/legacy`**: মডেল ফাইলগুলো স্টোর এবং চ্যাট হিস্ট্রি পারসিস্টেন্সের জন্য ব্যবহৃত।
    * *History File:* `chat_history.json` ফাইলে সর্বশেষ ২০টি মেসেজ সংরক্ষিত থাকে।
* **`Storage Management`**: মডেল পরিবর্তনের সময় পুরনো ক্যাশ ফাইল স্বয়ংক্রিয়ভাবে মুছে ফোনের মেমোরি খালি রাখা হয়।

---

## 🧠 3. Intelligence Layer (Prompt & Context)
* **Context Windowing**: এআই-এর শর্ট-টার্ম মেমোরি বজায় রাখতে সর্বশেষ ৮টি মেসেজ স্লাইস করে কনটেক্সট হিসেবে পাঠানো হয়।
* **System Prompt Injection**: `Hidden Constraints` এবং ইউজারের কাস্টম নির্দেশনার সমন্বয় করে এআই-এর ব্যক্তিত্ব নির্ধারণ করা হয়।
* **Streaming Support**: `context.completion` ব্যবহার করে রিয়েল-টাইম টোকেন জেনারেশন।

---

## 🎨 4. UI Components (View)
* **`Header.js`**: মডেল নেম ডিসপ্লে, ড্রপডাউন মেনু এবং সেটিংস এক্সেস।
* **`MessageList.js` & `MessageItem.js`**: চ্যাট ইন্টারফেস যেখানে অটো-স্ক্রল এবং কোড কপি করার সুবিধা রয়েছে।
* **`guide.js`**: ইউজারের জন্য অফলাইন মডেল সেটআপ গাইডলাইন।
* **`styles.js`**: সম্পূর্ণ অ্যাপের জন্য সেন্ট্রাল স্টাইলশিট।

---

## ⚙️ 5. Technical Stack
* **Framework:** Expo SDK 54 (New Architecture Enabled)
* **Engine:** `llama.rn` (Native binding for llama.cpp)
* **Language:** JavaScript (React Native)
* **Runtime:** Hermes Engine

---

## 🔄 6. State Management Flow
1.  **Init:** অ্যাপ চালু হলে `useEffect` এর মাধ্যমে অটো-লোড মডেল চেক।
2.  **Input:** ইউজার মেসেজ দিলে `chatHistoryRef` থেকে কনটেক্সট তৈরি।
3.  **Process:** ল্যামা ইঞ্জিন থেকে স্ট্রিমিং ডাটা আসা এবং UI আপডেট।
4.  **Save:** জেনারেশন শেষ হলে ব্যাকগ্রাউন্ডে `chat_history.json` আপডেট।