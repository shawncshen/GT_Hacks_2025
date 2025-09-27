import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const url = "http://127.0.0.1:3000";

function PatientDashboard({ navigation, currentUser, patientID, onLogout }) {
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    console.log('PatientDashboard received patientID:', patientID);
    console.log('PatientDashboard received currentUser:', currentUser);
    fetchPatientName();
  }, []);

  const fetchPatientName = async () => {
    try {
      console.log('Fetching patient name for ID:', patientID);
      const response = await fetch(`${url}/patient/${patientID}`);
      const data = await response.json();
      console.log('Patient data received:', data);

      if (data.response === "success" && data.patient) {
        const fullName = `${data.patient.first_name || ''} ${data.patient.last_name || ''}`.trim();
        if (fullName) {
          setPatientName(fullName);
        } else {
          // No name data, use email
          setPatientName(currentUser);
        }
      } else {
        console.log('Failed to fetch patient or no data:', data.response);
        // Fallback to email if name fetch fails
        setPatientName(currentUser);
      }
    } catch (error) {
      console.error('Error fetching patient name:', error);
      // Fallback to email if name fetch fails
      setPatientName(currentUser);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome back :) </Text>
          <Text style={styles.subGreeting}>We hope you are feeling better today{'\n'}{patientName}! ✨</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.chatBotButton}
            onPress={() => navigation.navigate('ChatBot')}
          >
            <Text style={styles.chatBotIcon}>🤖</Text>
            <Text style={styles.chatBotButtonText}>Chat with Your Health Buddy! 💬</Text>
            <Text style={styles.chatBotSubText}>Get instant answers & feel supported</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.caregiverButton}
            onPress={() => navigation.navigate('CaregiverRequest')}
          >
            <Text style={styles.caregiverIcon}>👨‍⚕️</Text>
            <Text style={styles.caregiverButtonText}>Connect with Care Team! 🏥</Text>
            <Text style={styles.caregiverSubText}>Find amazing healthcare professionals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerContent: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e67e22',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    padding: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
  },
  buttonsContainer: {
    gap: 20,
  },
  chatBotButton: {
    backgroundColor: '#4CAF50',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  chatBotIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  chatBotButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  chatBotSubText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  caregiverButton: {
    backgroundColor: '#2196F3',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  caregiverIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  caregiverButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  caregiverSubText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default PatientDashboard;