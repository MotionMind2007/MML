import { useState, useEffect } from "react";
import { Keyboard } from "react-native";

export const useChatLayout = () => {
    const [inputHeight, setInputHeight] = useState(40);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

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
  return {
    inputHeight,
    keyboardVisible,
    handleContentSizeChange,
  };
};