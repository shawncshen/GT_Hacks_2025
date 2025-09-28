import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const url = "http://127.0.0.1:3001";

function PatientDashboard({ navigation, currentUser, patientID, onLogout }) {
  const [patientName, setPatientName] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    console.log('PatientDashboard received patientID:', patientID);
    console.log('PatientDashboard received currentUser:', currentUser);
    fetchPatientName();
  }, []);

  useEffect(() => {
    if (patientName && !isTyping) {
      startTypewriter();
    }
  }, [patientName]);

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

  const startTypewriter = () => {
    const fullText = `Welcome back, ${patientName}!`;
    setIsTyping(true);
    setDisplayedText('');

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 80); // Adjust speed here (lower = faster)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e8f4ff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.headerTitle}>
              {displayedText}
              {isTyping && <Text style={styles.cursor}>|</Text>}
            </Text>
            <Text style={styles.subGreeting}>We hope you're feeling better today ✨</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {/* Health Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>3/5</Text>
              <Text style={styles.overviewLabel}>Medications</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>2</Text>
              <Text style={styles.overviewLabel}>Appointments</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>85%</Text>
              <Text style={styles.overviewLabel}>Health Score</Text>
            </View>
          </View>
        </View>

        {/* Health Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.metricCard}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>Blood Pressure</Text>
              <Text style={[styles.metricValue, { color: '#6B7280' }]}>120/80</Text>
              <Text style={styles.metricUnit}>mmHg</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>Heart Rate</Text>
              <Text style={[styles.metricValue, { color: '#6B7280' }]}>72</Text>
              <Text style={styles.metricUnit}>bpm</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>Weight</Text>
              <Text style={[styles.metricValue, { color: '#6B7280' }]}>165</Text>
              <Text style={styles.metricUnit}>lbs</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>Blood Sugar</Text>
              <Text style={[styles.metricValue, { color: '#6B7280' }]}>95</Text>
              <Text style={styles.metricUnit}>mg/dL</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.quickActionText}>Add Symptom</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#667eea' }]}
              onPress={() => navigation.navigate('PrescriptionAlerts', { patientID })}
            >
              <Text style={styles.quickActionText}>View Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.quickActionText}>Call Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.quickActionText}>Lab Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.quickActionText}>Pharmacy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingIconContainer}>
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle}>Dr. Smith Appointment</Text>
              <Text style={styles.upcomingSubtitle}>Tomorrow at 2:00 PM</Text>
              <Text style={styles.upcomingDetails}>Annual checkup • Cardiology</Text>
            </View>
            <TouchableOpacity style={styles.upcomingAction}>
              <Text style={styles.upcomingActionText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Health Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}></View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Great Progress!</Text>
              <Text style={styles.insightText}>
                Your medication adherence has improved by 15% this week. Keep up the excellent work!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.chatBotButton}
            onPress={() => navigation.navigate('ChatBot')}
          >
            <View style={styles.buttonIcon}>
              <Text style={styles.chatBotIcon}>🤖</Text>
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.chatBotButtonText}>Health Assistant</Text>
              <Text style={styles.chatBotSubText}>Chat with your AI health buddy</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.caregiverButton}
            onPress={() => navigation.navigate('CaregiverRequest')}
          >
            <View style={styles.buttonIcon}>
              <Text style={styles.caregiverIcon}>👨‍⚕️</Text>
            </View>
            <View style={styles.buttonContent}>
              <Text style={styles.caregiverButtonText}>Care Team</Text>
              <Text style={styles.caregiverSubText}>Connect with healthcare professionals</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4ff',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 25,
  },
  greetingContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subGreeting: {
    fontSize: 16,
    fontWeight: '400',
    color: '#718096',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
    fontFamily: 'System',
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
    fontFamily: 'System',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '400',
  },
  buttonsContainer: {
    gap: 20,
  },
  chatBotButton: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  caregiverButton: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  buttonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  chatBotIcon: {
    fontSize: 28,
  },
  caregiverIcon: {
    fontSize: 28,
  },
  chatBotButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  chatBotSubText: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '400',
  },
  caregiverButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  caregiverSubText: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '400',
  },
  buttonArrow: {
    fontSize: 24,
    color: '#cbd5e0',
    fontWeight: '300',
  },
  logoutBtn: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#e53e3e',
    shadowColor: '#e53e3e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    color: '#e53e3e',
    fontSize: 18,
    fontWeight: '600',
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    right: 35,
    zIndex: 10,
  },
  profileIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIconText: {
    fontSize: 20,
    color: '#64748b',
  },
  cursor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#718096',
    marginBottom: 4,
    fontFamily: 'System',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  metricUnit: {
    fontSize: 14,
    color: '#a0aec0',
    fontFamily: 'System',
    fontWeight: '400',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 50,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'System',
  },
  upcomingCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  upcomingIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#e3f2fd',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 4,
    fontFamily: 'System',
  },
  upcomingSubtitle: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'System',
  },
  upcomingDetails: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'System',
    fontWeight: '400',
  },
  upcomingAction: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upcomingActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  insightIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
    fontFamily: 'System',
  },
  insightText: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    fontFamily: 'System',
    fontWeight: '400',
  },
});

export default PatientDashboard;