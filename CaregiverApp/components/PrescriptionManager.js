import React, { useState } from 'react';
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
} from 'react-native';

const url = "http://127.0.0.1:3001";

function PrescriptionManager({ navigation, route }) {
  const { patient, caregiverID } = route.params;
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      name: '',
      amount: '',
      frequency: '',
    }
  ]);

  const addPrescription = () => {
    const newId = prescriptions.length + 1;
    setPrescriptions([
      ...prescriptions,
      {
        id: newId,
        name: '',
        amount: '',
        frequency: '',
      }
    ]);
  };

  const removePrescription = (id) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
  };

  const updatePrescription = (id, field, value) => {
    setPrescriptions(prescriptions.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const submitPrescriptions = async () => {
    // Validate all prescriptions
    const validPrescriptions = prescriptions.filter(p =>
      p.name.trim() && p.amount.trim() && p.frequency.trim()
    );

    if (validPrescriptions.length === 0) {
      Alert.alert('Error', 'Please fill in at least one complete prescription');
      return;
    }

    try {
      const prescriptionsArray = validPrescriptions.map(p => ({
        name: p.name,
        amount: p.amount,
        frequency: p.frequency
      }));

      const response = await fetch(`${url}/post-prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          prescriptions: prescriptionsArray
        })
      });

      const data = await response.json();

      if (data.response === "success") {
        Alert.alert('Success', 'Prescriptions added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.response);
      }
    } catch (error) {
      console.error('Error submitting prescriptions:', error);
      Alert.alert('Error', 'Network error occurred');
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
          <Text style={styles.headerTitle}>Manage Prescriptions</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
          <Text style={styles.patientEmail}>{patient.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Add Prescriptions</Text>

        {prescriptions.map((prescription, index) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.prescriptionNumber}>Prescription {index + 1}</Text>
              {prescriptions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePrescription(prescription.id)}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                style={styles.input}
                value={prescription.name}
                onChangeText={(value) => updatePrescription(prescription.id, 'name', value)}
                placeholder="Enter medication name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount/Dosage</Text>
              <TextInput
                style={styles.input}
                value={prescription.amount}
                onChangeText={(value) => updatePrescription(prescription.id, 'amount', value)}
                placeholder="e.g., 1 pill, 5mg, 10ml"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency/Time</Text>
              <TextInput
                style={styles.input}
                value={prescription.frequency}
                onChangeText={(value) => updatePrescription(prescription.id, 'frequency', value)}
                placeholder="e.g., Once daily, Twice daily, Every 8 hours"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addPrescription}>
          <Text style={styles.addBtnText}>+ Add Another Prescription</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitBtn} onPress={submitPrescriptions}>
            <Text style={styles.submitBtnText}>Save Prescriptions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
  patientInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  patientEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  prescriptionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  prescriptionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  removeBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  removeBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 40,
  },
  submitBtn: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PrescriptionManager;