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
} from 'react-native';

const url = "http://127.0.0.1:3001";

function PrescriptionAlerts({ navigation, route }) {
  const { patientID } = route.params;
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      console.log('Fetching prescriptions for patient ID:', patientID);
      const response = await fetch(`${url}/patient-prescriptions/${patientID}`);
      const data = await response.json();
      console.log('Prescriptions data:', data);

      if (data.response === "success") {
        setPrescriptions(data.prescriptions);
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
                    <Text style={styles.detailLabel}>Frequency:</Text>
                    <Text style={styles.detailValue}>{prescription.prescription_frequency}</Text>
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
});

export default PrescriptionAlerts;