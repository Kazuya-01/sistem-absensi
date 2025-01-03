import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRootNavigationState, useRouter } from 'expo-router';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';

export default function Home() {
  const { routes } = useRootNavigationState();
  const [show, setShow] = useState(false);
  const { params } = routes[0];
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter(); // Untuk navigasi ke halaman index

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  type QRCodeResult = {
    data: String; // untuk properti data yang berisi dari hasil Qr-qode
  };

  async function handleScanned(qr: QRCodeResult) {
    setShow(false);

    const data = {
      nisn: params.nisn,
      status: 'h',
      koordinat: '-6.798919218710382, 106.77984713684613',
    };

    const response = await axios.post('http://192.168.1.10:8000/api/absensi', data, { headers: { Authorization: `Bearer ${qr.data}` } });

    if (response.data) {
      alert('Berhasil absen');
    }
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => router.replace('/') },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {show ? (
        <View style={styles.fullscreenCamera}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={qr => handleScanned(qr)}
            style={styles.camera}
            facing={facing}
          />
          {/* Tombol di bagian bawah kamera */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.buttonFlip} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonFlip} onPress={() => setShow(false)}>
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.greeting}>{params.nama}</Text>

          {/* Tombol untuk QR-Code */}
          <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
            <Text style={styles.buttonText}>QR-Code</Text>
          </TouchableOpacity>

          {/* Tombol untuk Online */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Online</Text>
          </TouchableOpacity>

          {/* Tombol Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2948',
    padding: 20,
  },
  fullscreenCamera: {
    flex: 1,
    width: '100%',
  },
  button: {
    width: 250,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  buttonFlip: {
    width: '40%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
