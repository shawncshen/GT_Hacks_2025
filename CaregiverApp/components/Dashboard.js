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
  const patients = [];

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
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.riskOverviewBtn}
            onPress={() => navigation.navigate('PatientRiskOverview')}
          >
            <Text style={styles.riskOverviewBtnText}>Risk Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectPatientsBtn}
            onPress={() => navigation.navigate('PatientSelector', { caregiverID: currentUser })}
          >
            <Text style={styles.selectPatientsBtnText}>Manage Patients</Text>
          </TouchableOpacity>
        </View>

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
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  riskOverviewBtn: {
    backgroundColor: '#e53e3e',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#e53e3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  riskOverviewBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectPatientsBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectPatientsBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Dashboard;