import React, { useState, useRef, useEffect } from 'react';
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
 StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';


// Conditional import for speech recognition (only works in development builds)
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = () => {};


try {
 const speechRecognition = require("expo-speech-recognition");
 ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule;
 useSpeechRecognitionEvent = speechRecognition.useSpeechRecognitionEvent;
} catch (error) {
 console.log("Speech recognition not available in Expo Go");
}


function ChatBot({ navigation, onLogout }) {
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


 // Load saved API key on component mount
 useEffect(() => {
   loadApiKey();
 }, []);


 // Speech recognition event handlers
 useSpeechRecognitionEvent("result", (event) => {
   setInputText(event.results[0]?.transcript || '');
 });


 useSpeechRecognitionEvent("end", () => {
   setRecognizing(false);
 });


 const loadApiKey = async () => {
   try {
     const savedApiKey = await AsyncStorage.getItem('groqApiKey');
     if (savedApiKey) {
       setApiKey(savedApiKey);
       setApiKeyValid(true);
     }
   } catch (error) {
     console.error('Error loading API key:', error);
   }
 };


 const saveApiKey = async (key) => {
   try {
     await AsyncStorage.setItem('groqApiKey', key);
   } catch (error) {
     console.error('Error saving API key:', error);
   }
 };


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
       await saveApiKey(apiKey);
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


   // Scroll to bottom
   setTimeout(() => {
     scrollViewRef.current?.scrollToEnd({ animated: true });
   }, 100);
 };


 const startSpeechRecognition = async () => {
   if (!ExpoSpeechRecognitionModule) {
     Alert.alert("Speech Recognition Unavailable", "Speech recognition requires a development build. For now, please type your message.");
     return;
   }


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
   if (ExpoSpeechRecognitionModule) {
     ExpoSpeechRecognitionModule.stop();
   }
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
     <StatusBar barStyle="dark-content" backgroundColor="#fff" />


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
         <SafeAreaView style={styles.header}>
           <View style={styles.headerContent}>
             <Text style={styles.headerTitle}>Medical Assistant 🏥</Text>
             <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
               <Text style={styles.logoutBtnText}>Logout</Text>
             </TouchableOpacity>
           </View>
         </SafeAreaView>


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
             style={[
               styles.iconButton,
               recognizing && styles.recordingButton,
               !ExpoSpeechRecognitionModule && styles.disabledButton
             ]}
             onPress={toggleVoiceInput}
             disabled={!ExpoSpeechRecognitionModule && !recognizing}
           >
             <Text style={styles.iconText}>
               {!ExpoSpeechRecognitionModule ? '🎤' : (recognizing ? '🔴' : '🎤')}
             </Text>
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


         <TouchableOpacity
           style={styles.dashboardBtn}
           onPress={() => navigation.navigate('PatientDashboard')}
         >
           <Text style={styles.dashboardBtnText}>Back to Dashboard</Text>
         </TouchableOpacity>
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
   borderBottomWidth: 1,
   borderBottomColor: '#e0e0e0',
 },
 headerContent: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   padding: 20,
 },
 headerTitle: {
   fontSize: 24,
   fontWeight: 'bold',
   color: '#333',
 },
 logoutBtn: {
   backgroundColor: '#e74c3c',
   paddingHorizontal: 15,
   paddingVertical: 8,
   borderRadius: 5,
 },
 logoutBtnText: {
   color: 'white',
   fontSize: 16,
   fontWeight: '500',
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
 dashboardBtn: {
   backgroundColor: '#2ecc71',
   padding: 18,
   borderRadius: 12,
   alignItems: 'center',
   margin: 10,
 },
 dashboardBtnText: {
   color: 'white',
   fontSize: 18,
   fontWeight: '600',
 },
});


export default ChatBot;