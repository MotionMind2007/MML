import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import styles from "../../styles";

const Header = ({
    modelName,
    setShowDropdown,
    showDropdown,
    pickAndPrepareModel,
    setTempPrompt,
    systemPrompt,
    setIsModalVisible,
    setIsGuideVisible,
    setMessages,
    chatHistoryRef,
    context,
}) => {
    return (
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
                    <View style={[styles.statusDot, { backgroundColor: modelName ? '#28a745' : '#ff3b30' }]} />
                    <Text
                        style={styles.statusText}
                    >
                        {modelName ? 'is now Online 😍' : 'is now Offline 😞'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowDropdown(!showDropdown)}
            >
                <Ionicons name="settings-outline" size={28} color="#333" />
            </TouchableOpacity>

            
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
                        onPress={() => {
                            setShowDropdown(false); 
                            setIsGuideVisible(true);
                        }}
                    >
                        <Ionicons name="information-circle-outline" size={20} color="#000000" />
                        <Text style={styles.menuText}>About & Setup Guide</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={async () => {
                            setShowDropdown(false);
                            setMessages([{ id: Date.now().toString(), text: 'চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে।', sender: 'other' }]);
                            if (chatHistoryRef && chatHistoryRef.current) {
                                chatHistoryRef.current = [];
                                console.log("Chat history cleared.");
                            }
                            if (context) {
                                try {
                                    await context.clearCache();
                                    console.log("Context cache cleared.");
                                } catch (error) {
                                    console.log("Context clear error:", error);
                                }
                            }
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        <Text style={[styles.menuText, {color: '#FF3B30'}]}>Clear Chat</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default Header;