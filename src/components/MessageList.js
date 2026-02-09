import React from "react";
import { 
    View, 
    Text, 
    FlatList, 
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    TextInput,
    ActivityIndicator
} from "react-native";
import styles from "../../styles";

const MessageSystem = ({ 
    messages,
    inputText,
    setInputText,
    isGenerating,
    isProcessing,
    sendMessage,
    inputHeight,
    handleContentSizeChange,
    keyboardVisible,
    flatListRef,
    renderMessage
}) => {
    return (
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
                        <ActivityIndicator size="small" color="#007AFF" />
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
    );
};
export default MessageSystem;