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
  SafeAreaView,
  StatusBar,
} from 'react-native';

function CreateAccountForm({ navigation, onAccountCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '', // 'patient' or 'caregiver'
    phoneNumber: '',
    // Caregiver specific
    professionalId: '',
    workplace: '',
    // Patient specific
    dateOfBirth: '',
    primaryCaregiverName: '',
    medicalRecordNumber: '',
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    if (!formData.role) newErrors.role = 'Please select a role';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Username validation (no spaces, special characters)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.username && !usernameRegex.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again');
      return;
    }

    // Here you would typically send the data to your backend
    Alert.alert(
      'Account Created Successfully!',
      `Welcome ${formData.firstName}! Your ${formData.role} account has been created.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate successful account creation and login
            onAccountCreated(formData.username, formData.role);
          }
        }
      ]
    );
  };

  const renderRoleButtons = () => (
    <View style={styles.roleContainer}>
      <Text style={styles.label}>Role *</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'patient' && styles.roleButtonSelected
          ]}
          onPress={() => updateField('role', 'patient')}
        >
          <Text style={[
            styles.roleButtonText,
            formData.role === 'patient' && styles.roleButtonTextSelected
          ]}>
            Patient
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'caregiver' && styles.roleButtonSelected
          ]}
          onPress={() => updateField('role', 'caregiver')}
        >
          <Text style={[
            styles.roleButtonText,
            formData.role === 'caregiver' && styles.roleButtonTextSelected
          ]}>
            Caregiver
          </Text>
        </TouchableOpacity>
      </View>
      {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
    </View>
  );

  const renderRoleSpecificFields = () => {
    if (formData.role === 'caregiver') {
      return (
        <View style={styles.roleSpecificSection}>
          <Text style={styles.sectionTitle}>Caregiver Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Professional ID / License Number</Text>
            <TextInput
              style={styles.input}
              value={formData.professionalId}
              onChangeText={(value) => updateField('professionalId', value)}
              placeholder="e.g., RN123456, MD789012"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Workplace / Organization</Text>
            <TextInput
              style={styles.input}
              value={formData.workplace}
              onChangeText={(value) => updateField('workplace', value)}
              placeholder="e.g., City General Hospital"
            />
          </View>
        </View>
      );
    }

    if (formData.role === 'patient') {
      return (
        <View style={styles.roleSpecificSection}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(value) => updateField('dateOfBirth', value)}
              placeholder="MM/DD/YYYY"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Primary Caregiver Name</Text>
            <TextInput
              style={styles.input}
              value={formData.primaryCaregiverName}
              onChangeText={(value) => updateField('primaryCaregiverName', value)}
              placeholder="e.g., Dr. Smith or John Doe"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Medical Record Number</Text>
            <TextInput
              style={styles.input}
              value={formData.medicalRecordNumber}
              onChangeText={(value) => updateField('medicalRecordNumber', value)}
              placeholder="e.g., MRN12345678"
            />
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#667eea" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our healthcare community</Text>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateField('phoneNumber', value)}
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Account Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  value={formData.username}
                  onChangeText={(value) => updateField('username', value)}
                  placeholder="Choose a unique username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder="Create a secure password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  placeholder="Confirm your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            </View>

            {/* Role Selection */}
            {renderRoleButtons()}

            {/* Role-Specific Fields */}
            {renderRoleSpecificFields()}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  roleContainer: {
    marginBottom: 25,
  },
  roleButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  roleButtonTextSelected: {
    color: 'white',
  },
  roleSpecificSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    lineHeight: 16,
  },
});

export default CreateAccountForm;