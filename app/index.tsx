import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ImageBackground, Platform } from 'react-native';

export default function App() {
  const [nisn, setNisn] = useState('');
  const [tanggal_lahir, setTanggal_lahir] = useState('');
  const router = useRouter()
  const handleLogin = async () => {
    const response = await axios.post('http://192.168.1.10:8000/api/login', { nisn, tanggal_lahir })
    const siswa = response.data.siswa
   
   console.log(response)
   try {
    Alert.alert('Login Success', `Welcome, ${siswa.nama}`);
    router.replace(`/tampilan-home?nisn=${siswa.nisn}&nama=${siswa.nama}`)
    
   } catch (error) {
    console.error(error)
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
              placeholder="Tanggal Lahir"
              value={tanggal_lahir}
              onChangeText={(text)=>setTanggal_lahir(text)}
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
    flex: 1,
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
