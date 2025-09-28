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
  Modal,
  Alert,
} from 'react-native';

function AppointmentScheduler({ navigation }) {
  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    doctorName: '',
    appointmentType: '',
    reason: '',
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const appointmentTypes = [
    'Regular Checkup',
    'Follow-up Visit',
    'Specialist Consultation',
    'Emergency',
    'Physical Therapy',
    'Lab Results Review',
    'Vaccination',
    'Prescription Refill',
  ];

  const doctorsList = [
    'Dr. Sarah Johnson - General Medicine',
    'Dr. Michael Chen - Cardiology',
    'Dr. Emily Rodriguez - Endocrinology',
    'Dr. David Kim - Orthopedics',
    'Dr. Lisa Thompson - Dermatology',
    'Dr. Robert Wilson - Neurology',
  ];

  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Generate next 30 days for date selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push(time);
      }
    }
    return times;
  };

  const availableDates = generateDates();
  const availableTimeSlots = generateTimeSlots();

  const handleDateSelect = (selectedDate) => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
    setShowDateModal(false);
  };

  const handleTimeSelect = (selectedTime) => {
    setFormData(prev => ({ ...prev, time: selectedTime }));
    setShowTimeModal(false);
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, appointmentType: type }));
    setShowTypeModal(false);
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({ ...prev, doctorName: doctor }));
    setShowDoctorModal(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const validateForm = () => {
    if (!formData.doctorName.trim()) {
      Alert.alert('Missing Information', 'Please select a doctor');
      return false;
    }
    if (!formData.appointmentType) {
      Alert.alert('Missing Information', 'Please select appointment type');
      return false;
    }
    if (!formData.reason.trim()) {
      Alert.alert('Missing Information', 'Please provide a reason for the visit');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowSuccessModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      time: new Date(),
      doctorName: '',
      appointmentType: '',
      reason: '',
    });
    setShowSuccessModal(false);
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
          <Text style={styles.headerTitle}>Schedule Appointment</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Appointment Details</Text>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Appointment Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.pickerButtonText}>{formatDate(formData.date)}</Text>
              <Text style={styles.pickerIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Appointment Time</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimeModal(true)}
            >
              <Text style={styles.pickerButtonText}>{formatTime(formData.time)}</Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </TouchableOpacity>
          </View>

          {/* Doctor Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Doctor</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDoctorModal(true)}
            >
              <Text style={[styles.pickerButtonText, !formData.doctorName && styles.placeholderText]}>
                {formData.doctorName || 'Choose a doctor...'}
              </Text>
              <Text style={styles.pickerIcon}>👨‍⚕️</Text>
            </TouchableOpacity>
          </View>

          {/* Appointment Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type of Appointment</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTypeModal(true)}
            >
              <Text style={[styles.pickerButtonText, !formData.appointmentType && styles.placeholderText]}>
                {formData.appointmentType || 'Select appointment type...'}
              </Text>
              <Text style={styles.pickerIcon}>🏥</Text>
            </TouchableOpacity>
          </View>

          {/* Reason/Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reason for Visit / Notes</Text>
            <TextInput
              style={styles.textArea}
              value={formData.reason}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
              placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>📋 Schedule Appointment</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Selection Modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {availableDates.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleDateSelect(date)}
                >
                  <Text style={styles.optionText}>{formatDate(date)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal */}
      <Modal visible={showTimeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {availableTimeSlots.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={styles.optionText}>{formatTime(time)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Doctor Selection Modal */}
      <Modal visible={showDoctorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Doctor</Text>
              <TouchableOpacity onPress={() => setShowDoctorModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {doctorsList.map((doctor, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleDoctorSelect(doctor)}
                >
                  <Text style={styles.optionText}>{doctor}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Appointment Type Modal */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {appointmentTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleTypeSelect(type)}
                >
                  <Text style={styles.optionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successHeader}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Appointment Scheduled!</Text>
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successDetail}>Date: {formatDate(formData.date)}</Text>
              <Text style={styles.successDetail}>Time: {formatTime(formData.time)}</Text>
              <Text style={styles.successDetail}>Doctor: {formData.doctorName}</Text>
              <Text style={styles.successDetail}>Type: {formData.appointmentType}</Text>
              <Text style={styles.confirmationText}>
                You will receive a confirmation email shortly.
              </Text>
            </View>
            <View style={styles.successButtons}>
              <TouchableOpacity style={styles.scheduleAnotherBtn} onPress={resetForm}>
                <Text style={styles.scheduleAnotherText}>Schedule Another</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
  },
  placeholderText: {
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  pickerIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  textArea: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  closeButton: {
    fontSize: 24,
    color: '#a0aec0',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  optionText: {
    fontSize: 16,
    color: '#2d3748',
  },
  // Success Modal Styles
  successContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successDetail: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 5,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  successButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  scheduleAnotherBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  scheduleAnotherText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
  doneBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  doneBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentScheduler;