import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const url = "http://127.0.0.1:3001";

function PatientSelector({ navigation, currentUser, caregiverID, onLogout }) {
  const [availablePatients, setAvailablePatients] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('PatientSelector mounted with caregiverID:', caregiverID);
    fetchPatients();
    fetchAssignedPatients();
    fetchIncomingRequests();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${url}/patients`);
      const data = await response.json();

      if (data.response === "success") {
        setAvailablePatients(data.patients);
      } else {
        Alert.alert('Error', 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const fetchAssignedPatients = async () => {
    try {
      const response = await fetch(`${url}/caregiver-patients/${caregiverID}`);
      const data = await response.json();

      if (data.response === "success") {
        setAssignedPatients(data.patients);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      console.log('Fetching notifications for caregiver ID:', caregiverID);
      const response = await fetch(`${url}/get-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: caregiverID })
      });
      const data = await response.json();
      console.log('Notifications data:', data);

      if (data.response === "success" && data.notifications) {
        // Convert notifications to request format for the UI
        const requests = await Promise.all(data.notifications.map(async (notification, index) => {
          if (notification.sender_type === "patient") {
            // Fetch patient details
            const patientResponse = await fetch(`${url}/patient/${notification.sender_id}`);
            const patientData = await patientResponse.json();

            if (patientData.response === "success") {
              return {
                id: `${notification.sender_id}-${caregiverID}-${index}`, // Create unique ID with index
                patient_id: notification.sender_id,
                patient_name: `${patientData.patient.first_name} ${patientData.patient.last_name}`,
                patient_email: patientData.patient.email,
                message: notification.message
              };
            }
          }
          return null;
        }));

        const validRequests = requests.filter(req => req !== null);

        // Remove duplicates based on patient_id to prevent duplicate keys
        const uniqueRequests = validRequests.filter((request, index, self) =>
          index === self.findIndex(r => r.patient_id === request.patient_id)
        );

        console.log('Setting incoming requests from notifications:', uniqueRequests);
        setIncomingRequests(uniqueRequests);
      } else {
        console.log('No notifications or error:', data.response);
        setIncomingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const assignPatient = async (patientId) => {
    try {
      const response = await fetch(`${url}/assign-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiver_id: caregiverID,
          patient_id: patientId
        })
      });

      const data = await response.json();

      if (data.response === "success") {
        Alert.alert('Success', 'Patient assigned successfully!');
        fetchAssignedPatients(); // Refresh the assigned patients list
      } else {
        Alert.alert('Error', data.response);
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const respondToRequest = async (requestId, accept) => {
    try {
      // Extract patient_id from the requestId (format: "patient_id-caregiver_id")
      const patient_id = requestId.split('-')[0];

      if (accept) {
        // If accepting, add the patient to caregiver_patients table
        const response = await fetch(`${url}/add-caregiver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: parseInt(patient_id),
            caregiver_id: caregiverID
          })
        });

        const data = await response.json();

        if (data.response === "success") {
          // Delete the notification after successful acceptance
          await fetch(`${url}/delete-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_id: parseInt(patient_id),
              receiver_id: caregiverID
            })
          });

          Alert.alert('Success', 'Patient request accepted!');
          fetchIncomingRequests(); // Refresh notifications
          fetchAssignedPatients(); // Refresh assigned patients
        } else {
          Alert.alert('Error', data.response);
        }
      } else {
        // If declining, delete the notification
        await fetch(`${url}/delete-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_id: parseInt(patient_id),
            receiver_id: caregiverID
          })
        });

        Alert.alert('Success', 'Request declined.');
        fetchIncomingRequests(); // Refresh to remove from display
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const isPatientAssigned = (patientId) => {
    return assignedPatients.some(p => p.patient_id === patientId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('PatientSelector render - incomingRequests:', incomingRequests);
  console.log('PatientSelector render - incomingRequests.length:', incomingRequests.length);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Patients</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Assigned Patients ({assignedPatients.length})</Text>
          {assignedPatients.length === 0 ? (
            <Text style={styles.emptyText}>No patients assigned yet</Text>
          ) : (
            assignedPatients.map((patient) => (
              <TouchableOpacity
                key={patient.patient_id}
                style={[styles.patientCard, styles.assignedCard]}
                onPress={() => navigation.navigate('PrescriptionManager', { patient, caregiverID })}
                activeOpacity={0.7}
              >
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
                  <Text style={styles.patientEmail}>{patient.email}</Text>
                </View>
                <View style={styles.patientActions}>
                  <Text style={styles.assignedLabel}>✓ Assigned</Text>
                  <Text style={styles.manageText}>Manage Prescriptions →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {incomingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Requests ({incomingRequests.length})</Text>
            {incomingRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestText}>{request.patient_name} wants you as their caregiver</Text>
                <Text style={styles.requestEmail}>{request.patient_email}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => respondToRequest(request.id, true)}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => respondToRequest(request.id, false)}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Patients</Text>
          {availablePatients.map((patient) => (
            <View key={patient.patient_id} style={styles.patientCard}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
                <Text style={styles.patientEmail}>{patient.email}</Text>
              </View>

              {isPatientAssigned(patient.patient_id) ? (
                <Text style={styles.alreadyAssigned}>Already Assigned</Text>
              ) : (
                <TouchableOpacity
                  style={styles.assignBtn}
                  onPress={() => assignPatient(patient.patient_id)}
                >
                  <Text style={styles.assignBtnText}>Assign</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.doneBtnText}>Done - Go to Dashboard</Text>
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
    fontSize: 14,
    fontWeight: '500',
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
  main: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assignedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  patientInfo: {
    flex: 1,
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
  assignBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  assignBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  alreadyAssigned: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '500',
  },
  assignedLabel: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: 'bold',
  },
  patientActions: {
    alignItems: 'flex-end',
  },
  manageText: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  doneBtn: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  doneBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  requestEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  declineBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  declineBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PatientSelector;