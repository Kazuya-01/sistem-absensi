import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ImageBackground } from 'react-native';

export default function App() {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()

  const handleLogin = () => {
  router.replace('/tampilan-home')
    if (!nisn || !password) {
      Alert.alert('Error', 'Please enter both NISN and password');
    } else {
      Alert.alert('Login Success', `Welcome, NISN: ${nisn}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            
            <TextInput
              style={styles.input}
              placeholder="NISN"
              value={nisn}
              onChangeText={setNisn}
              keyboardType="numeric" 
              placeholderTextColor="#b0b0b0"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#b0b0b0"
            />
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex:1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    padding: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6347', 
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ff6347', 
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff6347', 
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
