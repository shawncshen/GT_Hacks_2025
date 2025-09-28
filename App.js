import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';

const Stack = createNativeStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username) => {
    try {
      await AsyncStorage.setItem('currentUser', username);
      setIsAuthenticated(true);
      setCurrentUser(username);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;