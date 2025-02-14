import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRootNavigationState, useRouter } from 'expo-router';

export default function Home() {
  const { routes } = useRootNavigationState();
  const [show, setShow] = useState(false);
  const { params } = routes[0];
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [status, setStatus] = useState<string>(''); // Menyimpan status online/offline

  const [lineAnim] = useState(new Animated.Value(0));

  // Animasi garis scan yang bergerak dari atas ke bawah
  const startScanAnimation = () => {
    Animated.loop(
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
        easing: Easing.linear,
      })
    ).start();
  };

  useEffect(() => {
    if (show) {
      startScanAnimation(); // Mulai animasi saat kamera ditampilkan
    }
  }, [show]);

  // Jika izin kamera belum diberikan
  if (!permission) {
    return <View />;
  }

  // Jika izin kamera tidak diberikan
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Kami memerlukan izin Anda untuk menampilkan kamera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Berikan Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fungsi untuk menangani hasil scan QR Code
  async function handleScanned(qr: { data: string }) {
    setShow(false);

    try {
      // Cek status sesi sebelum melanjutkan
      const statusResponse = await axios.get("http://192.168.1.10:8000/api/cek-status");
      if (statusResponse.data.status === 'online') {
        alert('Absensi hanya bisa dilakukan saat offline');
        return;
      }

      // Kirim request absensi
      const data = {
        nisn: params.nisn,
        status: 'h',
        koordinat: '-6.798919218710382, 106.77984713684613',
      };

      const response = await axios.post('http://192.168.1.10:8000/api/absensi', data, {
        headers: { Authorization: `Bearer ${qr.data}` },
      });

      if (response.data) {
        alert('Berhasil absen');
      }
    } catch (error) {
      console.error("Gagal absen:", error);
      alert('Gagal melakukan absen, silakan coba lagi.');
    }
  }

  // Fungsi untuk mengganti posisi kamera (depan/ belakang)
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Fungsi untuk Logout
  function handleLogout() {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya', onPress: () => router.replace('/') },
      ]
    );
  }

  // Fungsi untuk cek status online
  const handleOnline = async () => {
    try {
      const response = await axios.get("http://192.168.1.10:8000/api/cek-status");
      if (response.data.status !== 'online') {
        return alert('Bukan sesi online');
      }
      router.push(`/online-screen?nisn=${params.nisn}&koordinat=${params.koordinat}`);
    } catch (error) {
      console.error("Error fetching status:", error);
      alert('Gagal memeriksa status online');
    }
  };

  return (
    <View style={styles.container}>
      {show ? (
        <View style={styles.fullscreenCamera}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScanned}
            style={styles.camera}
            facing={facing}
          />
          {/* Garis pemindaian animasi */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: lineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.buttonFlip} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonFlip} onPress={() => setShow(false)}>
              <Text style={styles.text}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.greeting}>{params.nama}</Text>

          <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
            <Text style={styles.buttonText}>QR-Code</Text>
          </TouchableOpacity>

          <Text>{status}</Text>
          <TouchableOpacity style={styles.button} onPress={handleOnline}>
            <Text style={styles.buttonText}>Online</Text>
          </TouchableOpacity>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
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
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
});
