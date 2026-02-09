import { useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { initLlama } from 'llama.rn';
import { Alert } from "react-native";

export const useLlamaManager = (setMessages, chatHistoryRef) => {
    const [context, setContext] = useState(null);
    const [modelName, setModelName] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const modelFolder = `${FileSystem.documentDirectory}models/`;
    const HISTORY_FILE = `${FileSystem.documentDirectory}chat_history.json`;


    const autoLoadModel = async () => {
        if (context) return; // যদি কনটেক্সট ইতিমধ্যে সেট করা থাকে, তাহলে কিছু না করা হবে


        try {
            const folderInfo = await FileSystem.getInfoAsync(modelFolder);
            
            if (folderInfo.exists) {
                const files = await FileSystem.readDirectoryAsync(modelFolder);
                const modelFile = files.find(f => f.endsWith('.gguf'));

                if (modelFile) {
                    const modelPath = `${modelFolder}${modelFile}`;

                    setIsProcessing(true);
                    setStatusMessage(`Auto-loading ${modelFile}...`);

                    const llamaContext = await initLlama({
                        model: modelPath,
                        n_ctx: 2048,
                    });

                    if (modelFile) {

                        try {
                            const historyInfo = await FileSystem.getInfoAsync(HISTORY_FILE);
                            if (historyInfo.exists) {
                                const content = await FileSystem.readAsStringAsync(HISTORY_FILE);
                                const savedHistory = JSON.parse(content);

                                chatHistoryRef.current = savedHistory;

                                const uiMessages = savedHistory.map((m, index) => ({
                                    id: `old_${index}_${Date.now()}`,
                                    text: m.text,
                                    sender: m.sender,
                                    isAIChat: true
                                })).reverse();

                                setMessages(uiMessages);
                                console.log("✅ History synced with UI and Context");
                            } else {
                                setMessages([{ id: '1', text: 'স্বাগতম! আগের মডেল লোড হয়েছে।', sender: 'other' }]);
                            }
                        } catch (error) {
                            console.log("Recovery error:", error);
                        }
                    }
                    

                    setContext(llamaContext);
                    setModelName(modelFile);
                    setStatusMessage('is now online!😊✅');
                    setIsProcessing(false);
                } else {
                    setStatusMessage('Please add a model to start.');
                }
            }
        } catch (error) {
            console.log("Auto-load error:", error);
            setStatusMessage('Error auto-loading model. Please try again.');
            Alert.alert('Error', 'Failed to auto-load model. Please try again.');
            setIsProcessing(false);
        }
    };

    const pickAndPrepareModel = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            if (!file.name.endsWith('.gguf')) {
                alert('দয়া করে একটি .gguf ফাইল সিলেক্ট করুন!');
                return;
            }

            // নতুন মডেল লোড করার আগে পুরনো মেমোরি এবং হিস্ট্রি ক্লিয়ার করা
            if (chatHistoryRef && chatHistoryRef.current) {
                console.log("Old History Length:", chatHistoryRef.current.length);
                chatHistoryRef.current = [];
                console.log("Chat history cleared.");
            }

            // পুরনো কনটেক্সট রিলিজ করা
            if (context) {
                console.log("Releasing old context...");
                await context.release(); // পুরনো মেমোরি খালি করা
                setContext(null);
                console.log("⏳ Releasing old context get success...");
            }

            //Histoy delete kora!
            const historyInfo = await FileSystem.getInfoAsync(HISTORY_FILE);
            if (historyInfo.exists) {
                await FileSystem.deleteAsync(HISTORY_FILE, { idempotent: true });
                console.log("Old history file deleted.");
            }

            setIsProcessing(true);
            setStatusMessage(`Cleaning old cache...`);

            // পুরনো মডেল ফাইল মুছে ফেলা
            const folderInfo = await FileSystem.getInfoAsync(modelFolder);
            if (folderInfo.exists) {
                await FileSystem.deleteAsync(modelFolder, { idempotent: true });
            }

            await FileSystem.makeDirectoryAsync(modelFolder, { intermediates: true });
            setStatusMessage(`${file.name} is copying...`);
            const destPath = `${modelFolder}${file.name}`;

            await FileSystem.copyAsync({
                from: file.uri,
                to: destPath,
            });

            setStatusMessage(`${file.name} initializing in engine...`);

            const llamaContext = await initLlama({
                model: destPath,
                n_ctx: 2048,
            });
            setContext(llamaContext);
            setMessages([{ id: '1', text: `নতুন মডেল ${file.name} লোড হয়েছে! এখন চ্যাট শুরু করতে পারেন।`, sender: 'other' }]);
            setModelName(file.name);
            setStatusMessage('is now online!😊✅');
            setIsProcessing(false);
        } catch (error) {
            console.error(error);
            alert('মডেল সেটআপে সমস্যা হয়েছে! চেক করুন র‍্যাম পর্যাপ্ত আছে কি না।');
            setIsProcessing(false);
        }
    };

    return {
        context,
        modelName,
        isProcessing,
        statusMessage,
        autoLoadModel,
        pickAndPrepareModel
    };
}