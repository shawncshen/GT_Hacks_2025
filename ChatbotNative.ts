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

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      setMessages([...newMessages, { sender: 'AI', text: aiResponse }]);
      
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
      setMessages([...newMessages, { 
        sender: 'AI', 
        text: "I apologize, but something went wrong. Please try again." 
      }]);
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
    if (recognizing) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled) {
      Speech.stop();
    }
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
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Test API Key</Text>
            )}
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
                  msg.sender === 'User' ? styles.userMessage : styles.aiMessage
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  apiKeyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#667eea',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  apiKeyInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#764ba2',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  message: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#f093fb',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#667eea',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  recordingButton: {
    backgroundColor: '#ff6b6b',
  },
  mutedButton: {
    backgroundColor: '#6c757d',
  },
  iconText: {
    fontSize: 20,
  },
  sendButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 4,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatbotNative;