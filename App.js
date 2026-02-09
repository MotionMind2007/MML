import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import Header from './src/components/Header';
import MessageItem from './src/components/MessageItem';
import MessageSystem from './src/components/MessageList';
import { useChatLayout } from './src/hooks/useChatLayout';
import { useLlamaManager } from './src/hooks/useLlamaManager';
import { GUIDE_CONTENT } from './src/constants/guide';
import styles from './styles';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {

  const chatHistoryRef = useRef([]);

  const [messages, setMessages] = useState([
    { id: '1', text: 'স্বাগতম। প্রথমে একটা মডেল লোড করুন।', sender: 'other' },
  ]);

  //useLlamaManager থেকে প্রয়োজনীয় স্টেট এবং ফাংশনগুলো নিয়ে আসা
  const { 
    context, 
    modelName, 
    isProcessing, 
    statusMessage, 
    autoLoadModel, 
    pickAndPrepareModel 
  } = useLlamaManager(setMessages, chatHistoryRef);

  //useChatLayout থেকে ইনপুট ফিল্ডের উচ্চতা, কীবোর্ড ভিজিবিলিটি এবং কনটেন্ট সাইজ চেঞ্জ হ্যান্ডলার নিয়ে আসা
  const { inputHeight, keyboardVisible, handleContentSizeChange } = useChatLayout();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // মোডাল খোলা না কি বন্ধ
  const [systemPrompt, setSystemPrompt] = useState('You are "Motion Mind Local Assistant", a friendly and expert AI. Always keep your responses very short and professional.');
  const [tempPrompt, setTempPrompt] = useState(''); // টাইপ করার সময় সাময়িক প্রম্পট জমা রাখা
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  const saveHistoryToFile = (history) => {
    Promise.resolve().then(async () => {
      try {
        const HISTORY_FILE = `${FileSystem.documentDirectory}chat_history.json`;
        await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(history));
        console.log("✅histoy saved!");
      } catch (error) {
        console.log("❌ Background save error:", error);
      }
    });
  };

  // অ্যাপ লোড হওয়ার সাথে সাথে মডেল অটো-লোড করার চেষ্টা করা
  useEffect(() => {
    autoLoadModel();
  }, []);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };


  const buildLLMMessages = (currentInput) => {
    const conversation = [
      { role: 'system', content: systemPrompt }
    ];

    const recent = chatHistoryRef.current
    .slice(-8) // সর্বশেষ 8 মেসেজ নেওয়া হচ্ছে
    .map(msg => ({
      role: msg.sender === 'me' ? 'user' : 'assistant',
      content: msg.text
    }));
    return [...conversation, ...recent, { role: 'user', content: currentInput }];
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !context || isProcessing || isGenerating) {
      if(!context) alert("আগে মডেল লোড করুন!");
      return;
    }

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

      const startTime = Date.now();

      const conversationMessages = buildLLMMessages(currentInput);

      let fullResponse = "";
      await context.completion({
        messages: conversationMessages,
        n_predict: 256,
        sampling_params: {
          temp: 0.7,
          top_p: 0.9,
          repeat_penalty: 1.15,
        },

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

      const newUserEntry = { text: currentInput, sender: 'me' };
      const newAssistantEntry = { text: fullResponse.trim(), sender: 'other' };

      chatHistoryRef.current = [...chatHistoryRef.current, newUserEntry, newAssistantEntry].slice(-20);
      const updatedHistory = [...chatHistoryRef.current];

      saveHistoryToFile(updatedHistory);

    } catch (error) {
      console.log('Generation stopped or failed:', error);
    } finally {
      setIsGenerating(false);
    }
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderMessage = ({ item }) => (
    <MessageItem item={item} copyToClipboard={copyToClipboard} /> // copy btn and duration time and bold catch
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <Header
        modelName={modelName}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        pickAndPrepareModel={pickAndPrepareModel}
        setTempPrompt={setTempPrompt}
        systemPrompt={systemPrompt}
        setIsModalVisible={setIsModalVisible}
        setIsGuideVisible={setIsGuideVisible}
        setMessages={setMessages}
        chatHistoryRef={chatHistoryRef}
        context={context}
      />

      <MessageSystem
        messages={messages}
        inputText={inputText}
        setInputText={setInputText}
        isGenerating={isGenerating}
        isProcessing={isProcessing}
        sendMessage={sendMessage}
        inputHeight={inputHeight}
        handleContentSizeChange={handleContentSizeChange}
        keyboardVisible={keyboardVisible}
        flatListRef={flatListRef}
        renderMessage={renderMessage}
      />

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
                  {GUIDE_CONTENT.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g).map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <Text key={index} style={[styles.guideText, { fontWeight: 'bold', color: '#000' }]}>
                          {part.replace(/\*\*/g, '')}
                        </Text>
                      );
                    }

                    return (
                      <Text key={index} style={[styles.guideText, { fontSize: 13 }]} selectable={true}>
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