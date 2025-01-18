import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';

export default function App() {
  const [nisn, setNisn] = useState('');
  const [tanggal_lahir, setTanggal_lahir] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.1.10:8000/api/login', { nisn, tanggal_lahir });
      const siswa = response.data.siswa;

      Alert.alert('Login Success', `Welcome, ${siswa.nama}`);
      router.replace(`/tampilan-home?nisn=${siswa.nisn}&nama=${siswa.nama}&koordinat=${siswa.koordinat}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', 'Terjadi kesalahan');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>LOGIN</Text>

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
          placeholder="Tanggal Lahir"
          value={tanggal_lahir}
          onChangeText={setTanggal_lahir}
          placeholderTextColor="#b0b0b0"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2948', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2948',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1a2948',
    borderRadius: 25,
    paddingLeft: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#1a2948',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
