import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const url = "http://127.0.0.1:3001";

function PatientRiskOverview({ navigation, caregiverID }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const fetchAssignedPatients = async () => {
    try {
      console.log('Fetching assigned patients for caregiver ID:', caregiverID);
      const response = await fetch(`${url}/caregiver-patients/${caregiverID}`);
      const data = await response.json();
      console.log('Assigned patients data:', data);

      if (data.response === "success" && data.patients) {
        // Enhance patient data with risk metrics
        const enhancedPatients = data.patients.map(patient => ({
          ...patient,
          name: `${patient.first_name} ${patient.last_name}`,
          age: Math.floor(Math.random() * 40) + 40, // Random age 40-80
          riskScore: Math.floor(Math.random() * 60) + 30, // Random score 30-90
          riskLevel: getRiskLevel(Math.floor(Math.random() * 60) + 30),
          adherence: Math.floor(Math.random() * 50) + 50, // Random 50-100%
          voiceScore: (Math.random() * 8 + 2).toFixed(1), // Random 2.0-10.0
          lastContact: getRandomLastContact(),
          conditions: getRandomConditions(),
          activeAlerts: Math.floor(Math.random() * 5), // Random 0-4 alerts
          statusColor: getStatusColor(Math.floor(Math.random() * 60) + 30)
        }));

        setPatients(enhancedPatients);
      } else {
        console.log('No assigned patients found');
        setPatients([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getStatusColor = (score) => {
    if (score >= 80) return "#e53e3e";
    if (score >= 60) return "#f6ad55";
    return "#48bb78";
  };

  const getRandomLastContact = () => {
    const options = ["1 hour ago", "6 hours ago", "1 day ago", "2 days ago", "5 days ago"];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getRandomConditions = () => {
    const allConditions = [
      "COPD", "Osteoporosis", "Type 2 Diabetes", "Hypertension",
      "Heart Disease", "Depression", "Mild Anxiety", "Arthritis"
    ];
    const numConditions = Math.floor(Math.random() * 3) + 1; // 1-3 conditions
    const shuffled = allConditions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numConditions);
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "#e53e3e"; // Red - High Risk
    if (score >= 60) return "#f6ad55"; // Orange - Medium Risk
    return "#48bb78"; // Green - Low Risk
  };

  const getAdherenceColor = (adherence) => {
    if (adherence >= 80) return "#48bb78"; // Green - Good
    if (adherence >= 60) return "#f6ad55"; // Orange - Fair
    return "#e53e3e"; // Red - Poor
  };

  const getVoiceColor = (score) => {
    if (score >= 7) return "#48bb78"; // Green - Good
    if (score >= 4) return "#f6ad55"; // Orange - Fair
    return "#e53e3e"; // Red - Concerning
  };

  const handlePatientPress = (patient) => {
    // Navigate to detailed patient view
    navigation.navigate('PatientDetail', { patientId: patient.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading patient risk data...</Text>
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
          <Text style={styles.headerTitle}>Patient Risk Overview</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Risk Overview</Text>

          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => handlePatientPress(patient)}
              activeOpacity={0.7}
            >
              {/* Patient Header */}
              <View style={styles.patientHeader}>
                <View style={styles.patientInfo}>
                  <View style={styles.statusIndicatorContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: patient.statusColor }]} />
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientAge}>Age {patient.age}</Text>
                  </View>
                </View>
                <View style={styles.riskScoreContainer}>
                  <Text style={[styles.riskScore, { color: getRiskScoreColor(patient.riskScore) }]}>
                    {patient.riskScore}
                  </Text>
                </View>
              </View>

              {/* Metrics Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Adherence:</Text>
                  <Text style={[styles.metricValue, { color: getAdherenceColor(patient.adherence) }]}>
                    {patient.adherence}%
                  </Text>
                </View>

                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Voice:</Text>
                  <Text style={[styles.metricValue, { color: getVoiceColor(patient.voiceScore) }]}>
                    {patient.voiceScore}/10
                  </Text>
                </View>

                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Last:</Text>
                  <Text style={styles.metricValue}>{patient.lastContact}</Text>
                </View>
              </View>

              {/* Conditions */}
              <View style={styles.conditionsRow}>
                {patient.conditions.map((condition, index) => (
                  <View key={index} style={styles.conditionTag}>
                    <Text style={styles.conditionText}>{condition}</Text>
                  </View>
                ))}
              </View>

              {/* Active Alerts */}
              {patient.activeAlerts > 0 && (
                <View style={styles.alertsRow}>
                  <Text style={styles.alertText}>
                    {patient.activeAlerts} Active Alert{patient.activeAlerts !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Risk Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {patients.filter(p => p.riskLevel === 'high').length}
              </Text>
              <Text style={styles.summaryLabel}>High Risk</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#e53e3e' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {patients.filter(p => p.riskLevel === 'medium').length}
              </Text>
              <Text style={styles.summaryLabel}>Medium Risk</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#f6ad55' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {patients.filter(p => p.riskLevel === 'low').length}
              </Text>
              <Text style={styles.summaryLabel}>Low Risk</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#48bb78' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {patients.reduce((sum, p) => sum + p.activeAlerts, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Total Alerts</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: '#667eea' }]} />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  patientInfo: {
    flex: 1,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginRight: 8,
  },
  patientAge: {
    fontSize: 14,
    color: '#718096',
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskTrendIcon: {
    marginRight: 5,
  },
  trendIcon: {
    fontSize: 16,
  },
  riskScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginRight: 5,
  },
  iconText: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: '#4a5568',
    marginRight: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  conditionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  conditionTag: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  alertsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 8,
  },
  alertIconText: {
    fontSize: 16,
  },
  alertText: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  summaryIndicator: {
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  bottomSpace: {
    height: 40,
  },
});

export default PatientRiskOverview;