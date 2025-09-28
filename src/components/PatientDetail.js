import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PatientDetail({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

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
      notes: 'Patient is responding well to current medication regimen. Blood sugar levels have been stable.'
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
      notes: 'Blood pressure well controlled. Continue current medications.'
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
      notes: 'Recent EKG shows improvement. Patient reports feeling more energetic.'
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
      notes: 'Joint pain manageable with current treatment. Physical therapy recommended.'
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
      notes: 'Breathing difficulties stable. Continue oxygen therapy as prescribed.'
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
      notes: 'Bone density scan scheduled next month. Patient doing well with medications.'
    }
  };

  const patient = patientsData[id];

  if (!patient) {
    return (
      <div className="patient-detail">
        <div className="patient-not-found">
          <h2>Patient Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-detail">
      <header className="patient-detail-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="patient-detail-main">
        <div className="patient-detail-content">
          <div className="patient-header">
            <h1>{patient.name}</h1>
            <span className="patient-id">Patient ID: {patient.id}</span>
          </div>

          <div className="patient-info-grid">
            <div className="info-section">
              <h3>Basic Information</h3>
              <div className="info-item">
                <label>Age:</label>
                <span>{patient.age} years old</span>
              </div>
              <div className="info-item">
                <label>Primary Condition:</label>
                <span>{patient.condition}</span>
              </div>
              <div className="info-item">
                <label>Address:</label>
                <span>{patient.address}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{patient.phone}</span>
              </div>
              <div className="info-item">
                <label>Emergency Contact:</label>
                <span>{patient.emergencyContact}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Medical Information</h3>
              <div className="info-item">
                <label>Current Medications:</label>
                <ul className="medication-list">
                  {patient.medications.map((med, index) => (
                    <li key={index}>{med}</li>
                  ))}
                </ul>
              </div>
              <div className="info-item">
                <label>Known Allergies:</label>
                <span>{patient.allergies.join(', ')}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Appointments & Care</h3>
              <div className="info-item">
                <label>Last Visit:</label>
                <span>{patient.lastVisit}</span>
              </div>
              <div className="info-item">
                <label>Next Appointment:</label>
                <span>{patient.nextAppointment}</span>
              </div>
              <div className="info-item">
                <label>Care Notes:</label>
                <p className="care-notes">{patient.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDetail;