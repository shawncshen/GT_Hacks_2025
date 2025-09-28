import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const patients = [
    { id: 'P001', name: 'John Smith', age: 75, condition: 'Diabetes Type 2' },
    { id: 'P002', name: 'Mary Johnson', age: 68, condition: 'Hypertension' },
    { id: 'P003', name: 'Robert Brown', age: 82, condition: 'Heart Disease' },
    { id: 'P004', name: 'Linda Davis', age: 71, condition: 'Arthritis' },
    { id: 'P005', name: 'William Wilson', age: 79, condition: 'COPD' },
    { id: 'P006', name: 'Patricia Miller', age: 66, condition: 'Osteoporosis' }
  ];

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Caregiver Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {currentUser}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="patients-section">
          <h2>Your Patients ({patients.length})</h2>
          <div className="patients-grid">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="patient-card"
                onClick={() => handlePatientClick(patient.id)}
              >
                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p className="patient-id">ID: {patient.id}</p>
                  <p className="patient-age">Age: {patient.age}</p>
                  <p className="patient-condition">{patient.condition}</p>
                </div>
                <div className="patient-actions">
                  <span className="view-details">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;