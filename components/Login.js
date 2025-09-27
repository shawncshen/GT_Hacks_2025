import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

function Login({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Mock user database with roles
  const users = {
    'caregiver1': { password: 'password123', role: 'caregiver' },
    'patient1': { password: 'patient123', role: 'patient' },
    'admin': { password: 'admin123', role: 'admin' },
    'test': { password: 'test123', role: 'unknown' }
  };

  const handleSubmit = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    const user = users[username.toLowerCase()];

    if (user && user.password === password) {
      onLogin(username, user.role);
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginForm}>
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => navigation.navigate('CreateAccountForm')}
          >
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo accounts:</Text>
            <Text style={styles.demoText}>Caregiver: caregiver1 / password123</Text>
            <Text style={styles.demoText}>Patient: patient1 / patient123</Text>
            <Text style={styles.demoText}>Unknown: test / test123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginForm: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginBtn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  createAccountBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  createAccountText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '500',
  },
  demoCredentials: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});

export default Login;