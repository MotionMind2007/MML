import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { initLlama } from 'llama.rn';
import { ActivityIndicator, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { GUIDE_CONTENT } from './guide';
import styles from './styles';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'স্বাগতম। প্রথমে একটা মডেল লোড করুন।', sender: 'other' },
  ]);

  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modelName, setModelName] = useState(null);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // মোডাল খোলা না কি বন্ধ
  const [systemPrompt, setSystemPrompt] = useState('You are "Motion Mind Local Assistant", a friendly and expert AI. Always keep your responses very short and professional.');
  const [tempPrompt, setTempPrompt] = useState(''); // টাইপ করার সময় সাময়িক প্রম্পট জমা রাখা
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  const saveHistoryToFile = async (updatedMessages) => {
    const path = `${FileSystem.documentDirectory}chat_history.json`;
    try {
      const chatOnly = updatedMessages.filter(msg => msg.isAIChat === true);
      const historyToSave = chatOnly.slice(0, 20);
      await FileSystem.writeAsStringAsync(path, JSON.stringify(historyToSave));
    } catch (error) {
      console.log("সেভ করতে সমস্যা হয়েছে:", error);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      const path = `${FileSystem.documentDirectory}chat_history.json`;
      try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(path);
          const savedMessages = JSON.parse(content);
          if (savedMessages.length > 0) {
            setMessages(savedMessages);
            return;
          }
        }
        setMessages([{ id: '1', text: 'স্বাগতম। প্রথমে একটা মডেল লোড করুন।', sender: 'other' }]);
      } catch (error) {
        console.log("Load error:", error);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const autoLoadModel = async () => {
      if (context) {
        console.log("Model is already loaded and active.");
        return; 
      }

      try {
        const cacheFolder = `${FileSystem.cacheDirectory}models/`;
        const folderInfo = await FileSystem.getInfoAsync(cacheFolder);

        if (folderInfo.exists) {
          const files = await FileSystem.readDirectoryAsync(cacheFolder);
          const modelFile = files.find(f => f.endsWith('.gguf'));

          if (modelFile) {
            const modelPath = `${cacheFolder}${modelFile}`;

            setIsProcessing(true);
            setStatusMessage(`Auto-loading ${modelFile}...`);

            const llamaContext = await initLlama({
              model: modelPath,
              n_ctx: 512,
            });
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
        setIsProcessing(false);
      }
    };
    autoLoadModel();
  }, []);

  useEffect(() => {
    if (messages.length > 1) { // ডিফল্ট মেসেজের বেশি হলে সেভ করবে
      saveHistoryToFile(messages);
    }
  }, [messages]);

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

      if (context) {
        console.log("Releasing old context...");
        await context.release(); // পুরনো মেমোরি খালি করা
        setContext(null);
      }

      setIsProcessing(true);
      setStatusMessage(`Cleaning old cache...`); // Age cache clean hobe

      const cacheFolder = `${FileSystem.cacheDirectory}models/`;

      // >>> CACHE CLEAR LOGIC START <<<
      const folderInfo = await FileSystem.getInfoAsync(cacheFolder);
      if (folderInfo.exists) {
        await FileSystem.deleteAsync(cacheFolder, { idempotent: true });
      }
      await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });

      setStatusMessage(`${file.name} is copying...`);

      // ক্যাশে ফাইল পাথ সেটআপ
      const destPath = `${cacheFolder}${file.name}`;

      // ফাইল কপি করা (এটি একটু সময় নিতে পারে বড় ফাইলের ক্ষেত্রে)
      await FileSystem.copyAsync({
        from: file.uri,
        to: destPath,
      });

      setStatusMessage(`${file.name} initializing in engine...`);

      // Llama Engine শুরু করা
      const llamaContext = await initLlama({
        model: destPath,
        n_ctx: 512,
      });

      setContext(llamaContext);
      setMessages([{ id: '1', text: `নতুন মডেল ${file.name} লোড হয়েছে! এখন চ্যাট শুরু করতে পারেন।`, sender: 'other' }]);
      setModelName(file.name);
      setIsProcessing(false);
      setStatusMessage('is now online!😊✅');
    } catch (error) {
      console.error(error);
      alert('মডেল সেটআপে সমস্যা হয়েছে! চেক করুন র‍্যাম পর্যাপ্ত আছে কি না।');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // Tumi chaile ekhane ekta alert ba toast dite paro:
    // alert('Copied to clipboard!'); 
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !context || isProcessing || isGenerating) {
      if(!context) alert("আগে মডেল লোড করুন!");
      return;
    }

    const startTime = Date.now();
    const currentInput = inputText.trim();
    const userMsg = { id: Date.now().toString(), text: currentInput, sender: 'me', isAIChat: true };

    setMessages(prev => [userMsg, ...prev]);
    setInputText('');
    setIsGenerating(true);

    // AI-এর জন্য একটি খালি মেসেজ তৈরি করা (Streaming এর জন্য)
    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg = { id: aiMsgId, text: '...', sender: 'other', isAIChat: true, duration: null };
    setMessages(prev => [initialAiMsg, ...prev]);

    try {
      const contextMessages = [userMsg, ...messages];
      const chatContext = contextMessages
        .filter(m => m.isAIChat === true && m.text !== '...' && m.id !== userMsg.id)
        .slice(0, 6)
        .reverse()
        .map(m => `${m.sender === 'me' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n\n');

      const hiddenConstraint = "Constraint: Use maximum 2-3 sentences. No yapping. Be fast.";
      const fullPrompt = `System: ${systemPrompt} ${hiddenConstraint}\n\n${chatContext}\n\nUser: ${currentInput}\nAssistant:`;

      let fullResponse = "";
      await context.completion({
        prompt: fullPrompt,
        n_predict: 256,
        sampling_params: {
          temp: 0.7,
          top_p: 0.9,
          repeat_penalty: 1.5,
        },
        stop: ["User:", "System:", "Assistant:", "\nUser:", "\nSystem:"]
      }, (data) => {
        fullResponse += data.token;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: fullResponse.trimStart() } : m
        ));
      });

      const endTime = Date.now();
      const totalTime = ((endTime - startTime) / 1000).toFixed(1);

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, text: fullResponse.trim(), duration: totalTime } : m
      ));


    } catch (error) {
      console.log('Generation stopped or failed:', error);
    } finally {
      setIsGenerating(false);
    }
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);


  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    const newHeight = Math.min(120, Math.max(40, contentSize.height + 10));
    setInputHeight(newHeight);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';

    const formatText = (text) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={{ fontWeight: 'bold' }}>
              {part.replace(/\*\*/g, '')}
            </Text>
          );
        }
        return part;
      });
    };


    return (
      <View style={[styles.messageWrapper, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText,
            { color: isMe ? '#fff' : '#000' }
          ]}>
            {formatText(item.text)}
          </Text>
        </View>
      
        {/* মেসেজের নিচে কপি বাটন এবং জেনারেশন টাইম */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <TouchableOpacity 
            style={[styles.copyButton, isMe ? { marginRight: 8 } : { marginLeft: 8 }]} 
            onPress={() => copyToClipboard(item.text)}
          >
            <Ionicons name="copy-outline" size={14} color="#888" />
          </TouchableOpacity>

          {!isMe && item.duration && (
            <Text style={{ fontSize: 10, color: '#999', marginLeft: 4, fontStyle: 'italic' }}>
            • {item.duration}s
            </Text>
          )}
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text
            style={[styles.headerTitle, { color: modelName ? '#003f69' : '#694600' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {modelName ? `${modelName}` : 'Local AI'}
          </Text>
          <View style={styles.statusDotContainer}>
            <View style={[styles.statusDot, { backgroundColor: modelName ? '#00ca43' : '#ff3b30' }]} />
            <Text style={styles.statusText}>
              {modelName ? `is now Online 😊` : 'is now Offline😶'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
         style={styles.iconButton}
         onPress={() => setShowDropdown(!showDropdown)}
        >
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>

        {/* >>> ড্রপডাউন মেনু <<< */}
        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowDropdown(false);
                pickAndPrepareModel();
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#000" />
              <Text style={styles.menuText}>{modelName ? 'Change Model' : 'Add Model'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowDropdown(false);
                setTempPrompt(systemPrompt);
                setIsModalVisible(true);
              }}
            >
              <Ionicons name="terminal-outline" size={20} color="#000000" />
              <Text style={styles.menuText}>System Prompt</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={styles.menuItem} 
               onPress={() => {setShowDropdown(false); 
               setIsGuideVisible(true);}}>
              <Ionicons name="information-circle-outline" size={20} color="#000000" />
              <Text style={styles.menuText}>About & Setup Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={async () => {
                setShowDropdown(false);
                setMessages([{ id: Date.now().toString(), text: 'চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে।', sender: 'other' }]);
                try {
                  const path = `${FileSystem.documentDirectory}chat_history.json`;
                  await FileSystem.deleteAsync(path, { idempotent: true });
                } catch (e) {
                  console.log("Delete error:", e);
                }
               }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, {color: '#FF3B30'}]}>Clear Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={keyboardVisible ? (Platform.OS === 'ios' ? 'padding' : 'height') : undefined}
        keyboardVerticalOffset={keyboardVisible ? 0 : (Platform.OS === 'ios' ? 0 : -70)}
        enabled
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: keyboardVisible ? 120 : 40 }}
          ListFooterComponent={<View style={{ height: keyboardVisible ? 80 : 20 }} />}
        />

        <View style={[styles.inputContainer, { minHeight: inputHeight + 20 }]}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={inputText}
            onChangeText={setInputText}
            onContentSizeChange={handleContentSizeChange}
            placeholder="write a message..."
            placeholderTextColor="#888"
            multiline
            textAlignVertical="top"
          />
          {isGenerating ? (
            <View style={{ justifyContent: 'center', alignItems: 'center', width: 45, height: 45 }}>
              {/* স্টপ বাটনের বাইরে ঘুরতে থাকা লোডার */}
              <ActivityIndicator 
                size="small"
                color="#007AFF" 
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isProcessing) && { backgroundColor: '#A5A5A5' }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isProcessing}
            >
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {isProcessing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.overlayText}>{statusMessage}</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>System Prompt ⚙️</Text>

            <TextInput
              style={styles.modalInput}
              multiline
              value={tempPrompt}
              onChangeText={setTempPrompt}
              placeholder="যেমন: তুমি একজন কবি, সব উত্তর ছন্দে দাও..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setSystemPrompt(tempPrompt);
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isGuideVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Guide 📖</Text>

            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}>
                <View>
                  {GUIDE_CONTENT.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <Text key={index} style={[styles.guideText, { fontWeight: 'bold', color: '#000' }]}>
                          {part.replace(/\*\*/g, '')}
                        </Text>
                      );
                    }
                    return (
                      <Text key={index} style={styles.guideText}>
                        {part}
                      </Text>
                    );
                  })}
                </View>
            </ScrollView>
            
            <View style={{ alignItems: 'center', marginTop: 15 }}>
              <TouchableOpacity 
                style={styles.guideCloseButton} 
                onPress={() => setIsGuideVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}