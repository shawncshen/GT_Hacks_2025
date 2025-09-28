import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';
import PatientDashboard from './components/PatientDashboard';
import CreateAccount from './components/CreateAccount';
import CreateAccountForm from './components/CreateAccountForm';
import PatientSelector from './components/PatientSelector';
import CaregiverRequest from './components/CaregiverRequest';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';
import PrescriptionManager from './components/PrescriptionManager';
import PrescriptionAlerts from './components/PrescriptionAlerts';

const Stack = createNativeStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      const role = await AsyncStorage.getItem('userRole');
      const userId = await AsyncStorage.getItem('userID');
      if (user && role) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setUserRole(role);
        setUserID(userId ? parseInt(userId) : null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username, role, userId = null) => {
    try {
      await AsyncStorage.setItem('currentUser', username);
      await AsyncStorage.setItem('userRole', role);
      if (userId) {
        await AsyncStorage.setItem('userID', userId.toString());
      }
      setIsAuthenticated(true);
      setCurrentUser(username);
      setUserRole(role);
      setUserID(userId);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return null; // Or loading screen
  }

  const renderAuthenticatedScreens = () => {
    if (userRole === 'caregiver') {
      return (
        <>
          <Stack.Screen name="PatientSelector">
            {props => (
              <PatientSelector
                {...props}
                currentUser={currentUser}
                caregiverID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Dashboard">
            {props => (
              <Dashboard
                {...props}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="PatientDetail">
            {props => <PatientDetail {...props} onLogout={handleLogout} />}
          </Stack.Screen>
          <Stack.Screen name="PrescriptionManager">
            {props => (
              <PrescriptionManager
                {...props}
                caregiverID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        </>
      );
    } else if (userRole === 'patient') {
      return (
        <>
          <Stack.Screen name="PatientDashboard">
            {props => (
              <PatientDashboard
                {...props}
                currentUser={currentUser}
                patientID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CaregiverRequest">
            {props => (
              <CaregiverRequest
                {...props}
                currentUser={currentUser}
                patientID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ChatBot">
            {props => (
              <ChatBot
                {...props}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Profile">
            {props => (
              <Profile
                {...props}
                currentUser={currentUser}
                patientID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="PrescriptionAlerts">
            {props => (
              <PrescriptionAlerts
                {...props}
                patientID={userID}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        </>
      );
    } else {
      return (
        <Stack.Screen name="CreateAccount">
          {props => <CreateAccount {...props} onLogout={handleLogout} />}
        </Stack.Screen>
      );
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login">
              {props => <Login {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="CreateAccountForm">
              {props => <CreateAccountForm {...props} onAccountCreated={handleLogin} />}
            </Stack.Screen>
          </>
        ) : (
          renderAuthenticatedScreens()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;