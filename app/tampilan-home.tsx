import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRootNavigationState } from 'expo-router';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

export default function Home() {
  const { routes } = useRootNavigationState()
  const [show, setShow] = useState(false)
  const { params } = routes[0]
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function handleScanned(qr: any) {
    setShow(false)

    const data = {
      nisn: params.nisn,
      status: 'h',
      koordinat: '-6.798919218710382, 106.77984713684613'
    }

    const response = await axios.post('http://192.168.1.10:8000/api/absensi', data, { headers: { Authorization: `Bearer ${qr.data}` } })

    if (response.data) {
      alert('berhasil absen')
    }
  }
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }
  console.log(params)
  return (
    <View style={styles.container}>
      {show && (
        <View style={styles.scanner}>
          <CameraView barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={(qr) => handleScanned(qr)} style={styles.camera} facing={facing}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonFlip} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonFlip} onPress={() => setShow(false)}>
                <Text style={styles.text}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}


      <Text>
        {params.nama}
      </Text>
      {/* Tombol untuk QR-Code */}
      <TouchableOpacity style={styles.button} onPress={() => setShow(!show)}>
        <Text style={styles.buttonText}>QR-Code</Text>
      </TouchableOpacity>

      {/* Tombol untuk Online */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Online</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff', // Warna latar belakang
    padding: 20, // Padding di sekitar
  },
  button: {
    width: 250, // Lebar tombol
    height: 70, // Tinggi tombol
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6347', // Warna tombol
    marginVertical: 15, // Jarak antar tombol
    borderRadius: 12, // Membulatkan sudut tombol
    shadowColor: '#000', // Bayangan
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Untuk bayangan di Android
  },
  buttonText: {
    fontSize: 20, // Ukuran teks tombol
    fontWeight: 'bold', // Teks tebal
    color: '#fff', // Warna teks
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    gap: 5
  },

  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scanner: {
    position: "absolute",
    flex: 1,
    zIndex: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonFlip: {

    width: 200, // Lebar tombol
    height: 30, // Tinggi tombol
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6347', // Warna tombol
    marginVertical: 500, // Jarak antar tombol
    borderRadius: 12, // Membulatkan sudut tombol
    shadowColor: '#000', // Bayangan
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
