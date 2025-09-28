import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

function PatientDetail({ navigation, route, onLogout }) {
  const { patientId } = route.params;

  const patientsData = {
    'P001': {
      id: 'P001',
      name: 'John Smith',
      age: 75,
      condition: 'Diabetes Type 2',
      address: '123 Maple Street, Springfield, IL',
      phone: '(555) 123-4567',
      emergencyContact: 'Jane Smith - (555) 987-6543',
      medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
      allergies: ['Penicillin'],
      lastVisit: '2024-09-20',
      nextAppointment: '2024-10-05',
      notes: 'Patient is responding well to current medication regimen. Blood sugar levels have been stable.',
    },
    'P002': {
      id: 'P002',
      name: 'Mary Johnson',
      age: 68,
      condition: 'Hypertension',
      address: '456 Oak Avenue, Springfield, IL',
      phone: '(555) 234-5678',
      emergencyContact: 'Michael Johnson - (555) 876-5432',
      medications: ['Amlodipine 5mg', 'Hydrochlorothiazide 25mg'],
      allergies: ['None known'],
      lastVisit: '2024-09-18',
      nextAppointment: '2024-10-10',
      notes: 'Blood pressure well controlled. Continue current medications.',
    },
    'P003': {
      id: 'P003',
      name: 'Robert Brown',
      age: 82,
      condition: 'Heart Disease',
      address: '789 Pine Road, Springfield, IL',
      phone: '(555) 345-6789',
      emergencyContact: 'Susan Brown - (555) 765-4321',
      medications: ['Carvedilol 25mg', 'Aspirin 81mg', 'Clopidogrel 75mg'],
      allergies: ['Shellfish'],
      lastVisit: '2024-09-22',
      nextAppointment: '2024-10-01',
      notes: 'Recent EKG shows improvement. Patient reports feeling more energetic.',
    },
    'P004': {
      id: 'P004',
      name: 'Linda Davis',
      age: 71,
      condition: 'Arthritis',
      address: '321 Elm Street, Springfield, IL',
      phone: '(555) 456-7890',
      emergencyContact: 'David Davis - (555) 654-3210',
      medications: ['Ibuprofen 400mg', 'Glucosamine 1500mg'],
      allergies: ['Aspirin'],
      lastVisit: '2024-09-15',
      nextAppointment: '2024-10-15',
      notes: 'Joint pain manageable with current treatment. Physical therapy recommended.',
    },
    'P005': {
      id: 'P005',
      name: 'William Wilson',
      age: 79,
      condition: 'COPD',
      address: '654 Birch Lane, Springfield, IL',
      phone: '(555) 567-8901',
      emergencyContact: 'Carol Wilson - (555) 543-2109',
      medications: ['Albuterol inhaler', 'Prednisone 5mg', 'Oxygen therapy'],
      allergies: ['Latex'],
      lastVisit: '2024-09-25',
      nextAppointment: '2024-09-30',
      notes: 'Breathing difficulties stable. Continue oxygen therapy as prescribed.',
    },
    'P006': {
      id: 'P006',
      name: 'Patricia Miller',
      age: 66,
      condition: 'Osteoporosis',
      address: '987 Cedar Court, Springfield, IL',
      phone: '(555) 678-9012',
      emergencyContact: 'James Miller - (555) 432-1098',
      medications: ['Alendronate 70mg', 'Calcium carbonate 1200mg', 'Vitamin D3 2000IU'],
      allergies: ['None known'],
      lastVisit: '2024-09-12',
      nextAppointment: '2024-10-12',
      notes: 'Bone density scan scheduled next month. Patient doing well with medications.',
    },
  };

  const patient = patientsData[patientId];

  const sendMedicationReminder = () => {
    Alert.alert(
      'Medication Reminder Sent',
      `Notification sent to ${patient.name} to take their medication.`,
      [{ text: 'OK' }]
    );
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Patient Not Found</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
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
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.patientHeader}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientId}>Patient ID: {patient.id}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Age:</Text>
              <Text style={styles.value}>{patient.age} years old</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Primary Condition:</Text>
              <Text style={styles.value}>{patient.condition}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{patient.address}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{patient.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Emergency Contact:</Text>
              <Text style={styles.value}>{patient.emergencyContact}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Current Medications:</Text>
              {patient.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Text style={styles.medicationText}>• {med}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Known Allergies:</Text>
              <Text style={styles.value}>{patient.allergies.join(', ')}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Appointments & Care</Text>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Last Visit:</Text>
              <Text style={styles.value}>{patient.lastVisit}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Next Appointment:</Text>
              <Text style={styles.value}>{patient.nextAppointment}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Care Notes:</Text>
              <View style={styles.careNotes}>
                <Text style={styles.careNotesText}>{patient.notes}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.reminderBtn}
            onPress={sendMedicationReminder}
          >
            <Text style={styles.reminderBtnText}>
              📱 Send Medication Reminder
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  main: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  patientHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 3,
    borderBottomColor: '#667eea',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientId: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingBottom: 5,
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  medicationItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  medicationText: {
    fontSize: 14,
    color: '#333',
  },
  careNotes: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
    marginTop: 5,
  },
  careNotesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reminderBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  reminderBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notFoundTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default PatientDetail;