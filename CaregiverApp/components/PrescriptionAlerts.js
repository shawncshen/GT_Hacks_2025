import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';

const url = "http://127.0.0.1:3001";

function PrescriptionAlerts({ navigation, route }) {
  const { patientID } = route.params;
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    // Update timers every second
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        Object.keys(newTimers).forEach(key => {
          if (newTimers[key].timeLeft > 0) {
            newTimers[key].timeLeft -= 1;
          } else if (newTimers[key].timeLeft === 0) {
            // Show alert when timer reaches 0
            const prescriptionIndex = parseInt(key);
            if (prescriptions[prescriptionIndex] && !showAlert) {
              setCurrentAlert({
                prescriptionIndex: prescriptionIndex,
                medicationName: prescriptions[prescriptionIndex].prescription_name,
                dosage: prescriptions[prescriptionIndex].prescription_amount
              });
              setShowAlert(true);
            }
            // Set to -1 to prevent multiple alerts
            newTimers[key].timeLeft = -1;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [prescriptions]);

  const calculateNextDose = (frequency) => {
    // Parse frequency and calculate next dose time
    const freq = frequency.toLowerCase();
    let intervalHours = 24; // Default to once daily

    if (freq.includes('twice') || freq.includes('2')) {
      intervalHours = 12;
    } else if (freq.includes('three') || freq.includes('3')) {
      intervalHours = 8;
    } else if (freq.includes('four') || freq.includes('4')) {
      intervalHours = 6;
    } else if (freq.includes('every 8')) {
      intervalHours = 8;
    } else if (freq.includes('every 6')) {
      intervalHours = 6;
    } else if (freq.includes('every 4')) {
      intervalHours = 4;
    } else if (freq.includes('once')) {
      intervalHours = 24;
    }

    // For demo purposes, use shorter intervals (minutes instead of hours)
    const intervalMinutes = intervalHours * 5; // 5 minutes per "hour" for demo
    const timeLeft = Math.floor(Math.random() * intervalMinutes * 60); // Random time in seconds

    return {
      timeLeft: timeLeft,
      frequency: frequency,
      intervalSeconds: intervalMinutes * 60
    };
  };

  const formatTimeLeft = (seconds) => {
    if (seconds < 0) {
      return "Time for medication!";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleMedicationTaken = (taken) => {
    if (!currentAlert) return;

    if (taken) {
      // Patient took medication - reset timer to next dose
      setTimers(prevTimers => ({
        ...prevTimers,
        [currentAlert.prescriptionIndex]: calculateNextDose(
          prescriptions[currentAlert.prescriptionIndex].prescription_frequency
        )
      }));
      setShowAlert(false);
      setCurrentAlert(null);
    } else {
      // Patient didn't take medication - snooze for 5 minutes
      setTimers(prevTimers => ({
        ...prevTimers,
        [currentAlert.prescriptionIndex]: {
          ...prevTimers[currentAlert.prescriptionIndex],
          timeLeft: 300 // 5 minutes in seconds
        }
      }));
      setShowAlert(false);
      setCurrentAlert(null);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      console.log('Fetching prescriptions for patient ID:', patientID);
      const response = await fetch(`${url}/patient-prescriptions/${patientID}`);
      const data = await response.json();
      console.log('Prescriptions data:', data);

      if (data.response === "success") {
        setPrescriptions(data.prescriptions);

        // Initialize timers for each prescription
        const initialTimers = {};
        data.prescriptions.forEach((prescription, index) => {
          initialTimers[index] = calculateNextDose(prescription.prescription_frequency);
        });
        setTimers(initialTimers);
      } else {
        console.log('Error fetching prescriptions:', data.response);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Medications</Text>

          {prescriptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No prescriptions found</Text>
              <Text style={styles.emptySubtext}>Your caregiver hasn't assigned any medications yet.</Text>
            </View>
          ) : (
            prescriptions.map((prescription, index) => (
              <View key={index} style={styles.prescriptionCard}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{prescription.prescription_name}</Text>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertText}>💊</Text>
                  </View>
                </View>

                <View style={styles.prescriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dosage:</Text>
                    <Text style={styles.detailValue}>{prescription.prescription_amount}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next dose in:</Text>
                    <View style={styles.timerContainer}>
                      <Text style={styles.timerText}>
                        {timers[index] ? formatTimeLeft(timers[index].timeLeft) : 'Loading...'}
                      </Text>
                      <View style={styles.timerIcon}>
                        <Text style={styles.timerIconText}>⏰</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.frequencyRow}>
                    <Text style={styles.frequencyLabel}>Schedule: {prescription.prescription_frequency}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.reminderSection}>
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>📋 Important Reminders</Text>
            <Text style={styles.reminderText}>• Take medications as prescribed by your caregiver</Text>
            <Text style={styles.reminderText}>• Contact your caregiver if you have any questions</Text>
            <Text style={styles.reminderText}>• Don't skip doses unless advised</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backToHomeBtn}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.backToHomeBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Medication Alert Modal */}
      <Modal
        visible={showAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>💊</Text>
              <Text style={styles.alertTitle}>Medication Reminder</Text>
            </View>

            <View style={styles.alertContent}>
              <Text style={styles.alertMedication}>
                {currentAlert?.medicationName}
              </Text>
              <Text style={styles.alertDosage}>
                Take: {currentAlert?.dosage}
              </Text>
              <Text style={styles.alertQuestion}>
                Did you take your medication?
              </Text>
            </View>

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.yesButton}
                onPress={() => handleMedicationTaken(true)}
              >
                <Text style={styles.yesButtonText}>✓ Yes, I took it</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.noButton}
                onPress={() => handleMedicationTaken(false)}
              >
                <Text style={styles.noButtonText}>✗ No, remind me in 5 min</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  main: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  prescriptionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
  },
  alertBadge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  alertText: {
    fontSize: 18,
  },
  prescriptionDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#718096',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    flex: 2,
    textAlign: 'right',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginRight: 8,
    fontFamily: 'monospace',
  },
  timerIcon: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timerIconText: {
    fontSize: 16,
  },
  frequencyRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  frequencyLabel: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  reminderSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  reminderCard: {
    backgroundColor: '#fff8dc',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f6ad55',
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  reminderText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5,
    lineHeight: 20,
  },
  backToHomeBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  backToHomeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  alertContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  alertMedication: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertDosage: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 15,
    textAlign: 'center',
  },
  alertQuestion: {
    fontSize: 18,
    color: '#2d3748',
    textAlign: 'center',
    fontWeight: '500',
  },
  alertButtons: {
    gap: 12,
  },
  yesButton: {
    backgroundColor: '#48bb78',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noButton: {
    backgroundColor: '#f56565',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  noButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrescriptionAlerts;