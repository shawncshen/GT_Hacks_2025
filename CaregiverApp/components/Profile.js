import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

function Profile({ navigation, currentUser, patientID, onLogout }) {
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconLarge}>
            <Text style={styles.profileIconTextLarge}>👤</Text>
          </View>
          <Text style={styles.userName}>Patient Profile</Text>
          <Text style={styles.userEmail}>{currentUser}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionIcon}>👤</Text>
            <Text style={styles.optionText}>Personal Information</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionIcon}>🏥</Text>
            <Text style={styles.optionText}>Medical Information</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionIcon}>⚙️</Text>
            <Text style={styles.optionText}>Settings</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionIcon}>🔔</Text>
            <Text style={styles.optionText}>Notifications</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionIcon}>❓</Text>
            <Text style={styles.optionText}>Help & Support</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    paddingTop: 60,
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
  placeholder: {
    width: 40,
  },
  main: {
    flex: 1,
    padding: 25,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 30,
  },
  profileIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileIconTextLarge: {
    fontSize: 40,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
  },
  optionsContainer: {
    gap: 15,
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
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
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#2d3748',
  },
  optionArrow: {
    fontSize: 20,
    color: '#cbd5e0',
  },
  logoutBtn: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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
});

export default Profile;