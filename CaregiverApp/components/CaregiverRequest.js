import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const url = "http://127.0.0.1:3001";

function CaregiverRequest({ navigation, currentUser, patientID, onLogout }) {
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [myCaregiver, setMyCaregiver] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCaregiver();
    fetchRequests();
  }, []);

  const fetchMyCaregiver = async () => {
    try {
      const response = await fetch(`${url}/patient-caregiver/${patientID}`);
      const data = await response.json();

      if (data.response === "success" && data.caregiver) {
        setMyCaregiver(data.caregiver);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my caregiver:', error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      // Get pending requests I sent
      const pendingResponse = await fetch(`${url}/pending-requests/patient/${patientID}`);
      const pendingData = await pendingResponse.json();
      if (pendingData.response === "success") {
        setPendingRequests(pendingData.requests);
      }

      // Get incoming requests from caregivers
      const incomingResponse = await fetch(`${url}/incoming-requests/patient/${patientID}`);
      const incomingData = await incomingResponse.json();
      if (incomingData.response === "success") {
        setIncomingRequests(incomingData.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const requestCaregiverByEmail = async () => {
    if (!caregiverEmail.trim()) {
      Alert.alert('Error', 'Please enter a caregiver email');
      return;
    }

    try {
      // First, validate if caregiver email exists
      const validationResponse = await fetch(`${url}/caregivers`);
      const validationData = await validationResponse.json();

      if (validationData.response === "success") {
        const caregiverExists = validationData.caregivers.some(
          caregiver => caregiver.email.toLowerCase() === caregiverEmail.toLowerCase()
        );

        if (!caregiverExists) {
          Alert.alert('Error', 'Caregiver email is invalid!');
          return;
        }
      }

      const response = await fetch(`${url}/request-caregiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientID,
          caregiver_email: caregiverEmail,
          patient_email: currentUser
        })
      });

      const data = await response.json();

      if (data.response === "success") {
        Alert.alert('Success', 'Request sent! The caregiver will be notified.');
        setCaregiverEmail('');
        fetchRequests();
      } else {
        Alert.alert('Error', data.response);
      }
    } catch (error) {
      console.error('Error requesting caregiver:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const respondToRequest = async (requestId, accept) => {
    try {
      const response = await fetch(`${url}/respond-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          accept: accept
        })
      });

      const data = await response.json();

      if (data.response === "success") {
        Alert.alert('Success', accept ? 'Request accepted!' : 'Request declined.');
        fetchRequests();
        if (accept) {
          fetchMyCaregiver();
        }
      } else {
        Alert.alert('Error', data.response);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading caregivers...</Text>
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
          <Text style={styles.headerTitle}>Find Caregiver</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main}>
        {myCaregiver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Caregiver</Text>
            <View style={[styles.caregiverCard, styles.myCard]}>
              <Text style={styles.caregiverName}>{myCaregiver.first_name} {myCaregiver.last_name}</Text>
              <Text style={styles.caregiverEmail}>{myCaregiver.email}</Text>
              <Text style={styles.assignedLabel}>✓ Your Caregiver</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Caregiver</Text>
          <View style={styles.requestSection}>
            <Text style={styles.inputLabel}>Enter Caregiver's Email:</Text>
            <TextInput
              style={styles.emailInput}
              value={caregiverEmail}
              onChangeText={setCaregiverEmail}
              placeholder="caregiver@hospital.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.sendRequestBtn}
              onPress={requestCaregiverByEmail}
            >
              <Text style={styles.sendRequestBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests ({pendingRequests.length})</Text>
            {pendingRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestText}>Request sent to: {request.caregiver_email}</Text>
                <Text style={styles.requestStatus}>⏳ Waiting for response</Text>
              </View>
            ))}
          </View>
        )}

        {incomingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Caregiver Requests ({incomingRequests.length})</Text>
            {incomingRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestText}>{request.caregiver_name} wants to be your caregiver</Text>
                <Text style={styles.requestEmail}>{request.caregiver_email}</Text>
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

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('PatientDashboard')}
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
  caregiverCard: {
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
  myCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  caregiverEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  requestBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  requestBtnText: {
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
  requestSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  sendRequestBtn: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendRequestBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  requestStatus: {
    fontSize: 14,
    color: '#f39c12',
    marginTop: 8,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 10,
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

export default CaregiverRequest;