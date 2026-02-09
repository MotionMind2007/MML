import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from "../../styles";

const MessageItem = ({ item, copyToClipboard }) => {
    const isMe = item.sender === 'me';

    const formatText = (text) => {

        let cleanedText = text
            .replace(/<\|im_start\|>/g, "")
            .replace(/<\|user\|>/g, "")
            .replace(/<\|assistant\|>/g, "")
            .replace(/<\|im_end\|>/g, "")
            .replace(/\|am_end\|>/g, "")
            .replace(/<\|endoftext\|>/g, "")
            .replace(/<\|file_separator\|>/g, "")
        .trimStart();

    
        const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <Text key={index} style={{ fontWeight: 'bold' }}>
                        {part.replace(/\*\*/g, '')}
                    </Text>
                )
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
export default React.memo(MessageItem);