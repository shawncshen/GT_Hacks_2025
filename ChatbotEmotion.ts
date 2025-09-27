import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

function ChatbotNative() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: "Hello! I'm your medical portal assistant. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const scrollViewRef = useRef();

  // Speech recognition event handlers
  useSpeechRecognitionEvent("result", (event) => {
    setInputText(event.results[0]?.transcript || '');
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
  });

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key first!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setApiKeyValid(true);
        Alert.alert('Success', 'API key verified! Ready to assist you.');
      } else {
        setApiKeyValid(false);
        Alert.alert('Error', 'Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setApiKeyValid(false);
      Alert.alert('Error', 'Network error while testing API key!');
    } finally {
      setLoading(false);
    }
  };

  const detectEmotion = async (text) => {
    try {
      const response = await fetch('http://<YOUR_FLASK_SERVER>/detect_emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('Emotion API failed');
      const data = await response.json();
      return data.emotion || 'neutral';
    } catch (error) {
      console.error('Emotion detection error:', error);
      return 'neutral';
    }
  };

  const sendMessage = async (messageText = inputText) => {
    const message = messageText.trim();
    if (!message) return;
    if (!apiKey || !apiKeyValid) {
      Alert.alert('Error', 'Please test your GROQ API key first!');
      return;
    }

    const newMessages = [...messages, { sender: 'User', text: message }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      // 1. Get AI response
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a medical portal, and you will receive questions about what medication I can take. You need to respond professionally, but keep YOUR response short. You are talking to an elderly individual, so make sure you don't bore them with too much medical details. For reference my prescription is, I take vitamin C and B tablets"
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // 2. Detect emotion of the user's message
      const userEmotion = await detectEmotion(message);

      // 3. Add AI response and emotion to chat
      setMessages([
        ...newMessages,
        { sender: 'AI', text: aiResponse },
        { sender: 'System', text: `Detected emotion: ${userEmotion}`, isEmotion: true }
      ]);

      // 4. Speak AI response if enabled
      if (speechEnabled) {
        Speech.speak(aiResponse, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
          volume: 1.0,
          voice: 'com.apple.ttsbundle.siri_male_en-US_compact'
        });
      }
    } catch (error) {
      setMessages([...newMessages, { sender: 'AI', text: "I apologize, but something went wrong. Please try again." }]);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startSpeechRecognition = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert("Permission required", "Please grant microphone permissions");
        return;
      }

      setRecognizing(true);
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to start speech recognition");
      console.error(error);
    }
  };

  const stopSpeechRecognition = () => {
    ExpoSpeechRecognitionModule.stop();
    setRecognizing(false);
  };

  const toggleVoiceInput = () => {
    if (recognizing) stopSpeechRecognition();
    else startSpeechRecognition();
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled) Speech.stop();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {!apiKeyValid ? (
        <View style={styles.apiKeyContainer}>
          <Text style={styles.title}>Medical Portal Assistant</Text>
          <Text style={styles.subtitle}>Please enter your GROQ API key</Text>
          <TextInput
            style={styles.apiKeyInput}
            placeholder="Enter your GROQ API key"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={testApiKey}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Test API Key</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Medical Assistant 🏥</Text>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.message,
                  msg.sender === 'User' ? styles.userMessage : msg.isEmotion ? styles.emotionMessage : styles.aiMessage
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.loadingText}>Processing... 💊</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask me about medications..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              multiline
            />
            <TouchableOpacity 
              style={[styles.iconButton, recognizing && styles.recordingButton]} 
              onPress={toggleVoiceInput}
            >
              <Text style={styles.iconText}>{recognizing ? '🔴' : '🎤'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, !speechEnabled && styles.mutedButton]} 
              onPress={toggleSpeech}
            >
              <Text style={styles.iconText}>{speechEnabled ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={() => sendMessage()}
              disabled={loading || !inputText.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  emotionMessage: {
    backgroundColor: '#fcd34d',
    alignSelf: 'flex-start',
  },
});

export default ChatbotNative;
