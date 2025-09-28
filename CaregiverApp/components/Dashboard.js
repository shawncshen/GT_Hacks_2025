import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';

function Dashboard({ navigation, currentUser, onLogout }) {
  const patients = [
    { id: 'P001', name: 'John Smith', age: 75, condition: 'Diabetes Type 2' },
    { id: 'P002', name: 'Mary Johnson', age: 68, condition: 'Hypertension' },
    { id: 'P003', name: 'Robert Brown', age: 82, condition: 'Heart Disease' },
    { id: 'P004', name: 'Linda Davis', age: 71, condition: 'Arthritis' },
    { id: 'P005', name: 'William Wilson', age: 79, condition: 'COPD' },
    { id: 'P006', name: 'Patricia Miller', age: 66, condition: 'Osteoporosis' },
  ];

  const handlePatientPress = (patientId) => {
    navigation.navigate('PatientDetail', { patientId });
  };

  const renderPatientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => handlePatientPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientId}>ID: {item.id}</Text>
        <Text style={styles.patientAge}>Age: {item.age}</Text>
        <Text style={styles.patientCondition}>{item.condition}</Text>
      </View>
      <View style={styles.patientActions}>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Caregiver Dashboard</Text>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome, {currentUser}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.patientsSection}>
          <Text style={styles.sectionTitle}>
            Your Patients ({patients.length})
          </Text>
          <FlatList
            data={patients}
            renderItem={renderPatientItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.patientsList}
          />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
  patientsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  patientsList: {
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  patientInfo: {
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  patientCondition: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  patientActions: {
    alignItems: 'flex-end',
  },
  viewDetails: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Dashboard;