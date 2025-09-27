import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';

function ChatBot({ navigation, onLogout }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your health assistant. How can I help you today? You can type or press the microphone to speak.",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const simulateVoiceRecognition = () => {
    setIsListening(true);

    // Simulate voice recognition delay
    setTimeout(() => {
      setIsListening(false);
      const voiceInputs = [
        "How do I take my medication?",
        "I'm feeling dizzy today",
        "What time should I take my pills?",
        "I have a headache",
        "Can you remind me about my appointment?"
      ];
      const randomInput = voiceInputs[Math.floor(Math.random() * voiceInputs.length)];
      setInputText(randomInput);

      // Auto-send the voice input
      setTimeout(() => {
        sendMessage(randomInput);
        setInputText('');
      }, 500);
    }, 2000);
  };

  const sendMessage = (messageText = inputText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateBotResponse = (userMessage) => {
    const responses = {
      medication: [
        "Please take your medication with water as prescribed by your doctor. If you have questions about dosage, contact your caregiver.",
        "Remember to take your pills at the same time each day. Your caregiver can help set up reminders."
      ],
      pain: [
        "I understand you're not feeling well. Please rest and stay hydrated. If symptoms persist, contact your caregiver immediately.",
        "Your health is important. Please let your caregiver know about any pain or discomfort you're experiencing."
      ],
      appointment: [
        "I'll help you with appointment information. Your caregiver can provide the most up-to-date schedule.",
        "For appointment details, please check with your caregiver or call your doctor's office."
      ],
      general: [
        "I'm here to help with your health questions. Is there anything specific you'd like to know?",
        "Thank you for sharing. Your caregiver is the best person to help with detailed medical questions."
      ]
    };

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('medication') || lowerMessage.includes('pills') || lowerMessage.includes('medicine')) {
      return responses.medication[Math.floor(Math.random() * responses.medication.length)];
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('dizzy') || lowerMessage.includes('headache')) {
      return responses.pain[Math.floor(Math.random() * responses.pain.length)];
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor') || lowerMessage.includes('visit')) {
      return responses.appointment[Math.floor(Math.random() * responses.appointment.length)];
    } else {
      return responses.general[Math.floor(Math.random() * responses.general.length)];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isBot ? styles.botMessage : styles.userMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isBot ? styles.botText : styles.userText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.timestamp,
              message.isBot ? styles.botTimestamp : styles.userTimestamp
            ]}>
              {message.timestamp}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <Text style={styles.typingText}>Assistant is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message here..."
            placeholderTextColor="#999"
            multiline
            fontSize={18}
            onSubmitEditing={() => sendMessage()}
          />

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={simulateVoiceRecognition}
              disabled={isListening}
            >
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendMessage()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {isListening && (
          <Text style={styles.listeningText}>🎤 Listening... Speak now</Text>
        )}

        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.dashboardBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4ff',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backBtn: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 26,
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
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    maxWidth: '85%',
    marginVertical: 8,
    padding: 15,
    borderRadius: 20,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderBottomLeftRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 24,
  },
  botText: {
    color: '#1565c0',
  },
  userText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  botTimestamp: {
    color: '#1565c0',
  },
  userTimestamp: {
    color: 'white',
  },
  typingText: {
    fontSize: 16,
    color: '#1565c0',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginRight: 10,
    backgroundColor: '#fff',
    maxHeight: 100,
    fontSize: 18,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#FF5722',
  },
  micIcon: {
    fontSize: 24,
  },
  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  sendIcon: {
    fontSize: 24,
    color: 'white',
  },
  listeningText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#FF5722',
    fontWeight: '600',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 10,
  },
  dashboardBtn: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  dashboardBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChatBot;