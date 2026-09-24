import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://127.0.0.1:5000';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      Alert.alert(
        'Signup Successful',
        'Your Feedants account has been created.',
        [
          {
            text: 'Login',
            onPress: () => router.push('/login'),
          },
        ]
      );

      setName('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Feedants</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join Feedants and participate in competitions.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 24,
  },

  logo: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#e0e7ff',
    fontSize: 14,
    marginTop: 7,
  },

  card: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 22,
    borderRadius: 16,
    elevation: 4,
  },

  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },

  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    color: '#4f46e5',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
    fontWeight: '600',
  },
});