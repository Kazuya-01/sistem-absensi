import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { useRootNavigationState } from 'expo-router';
import axios from 'axios';

export default function AttendanceScreen() {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const { routes } = useRootNavigationState();
  const { params } = routes[0];
  const { nisn, koordinat, nama } = params; // Tambahkan 'nama' jika diperlukan

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert('Izin Ditolak', 'Izin lokasi diperlukan untuk menggunakan fitur ini.');
      }
    } catch (error) {
      console.error('Kesalahan izin:', error);
      Alert.alert('Kesalahan', 'Gagal mendapatkan izin lokasi.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (location.coords) {
        const { latitude, longitude } = location.coords;
        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert('Kesalahan', 'Lokasi tidak dapat diambil.');
      }
    } catch (error) {
      console.error('Kesalahan geolokasi:', error);
      Alert.alert('Kesalahan', 'Gagal mendapatkan lokasi. Silakan coba lagi.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      Alert.alert('Kesalahan', 'Harap pilih status kehadiran Anda.');
      return;
    }

    // Logika untuk status "Izin" dan "Sakit"
    if (selectedStatus === 'Izin' || selectedStatus === 'Sakit') {
      try {
        // Kirim data ke server
        const statusCode = selectedStatus === 'Izin' ? 'i' : 's';
        const data = {
          nisn: nisn,
          status: statusCode,
          koordinat: `${currentLocation.latitude}, ${currentLocation.longitude}`,
        };

        const responsToken = await axios.get('http://192.168.1.10:8000/api/generate-token');
        const token = responsToken.data.token;

        const respons = await axios.post('http://192.168.1.10:8000/api/absensi', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (respons.data) {
          // Setelah data terkirim, buka WhatsApp dengan format pesan
          const phoneNumber = '08323248332'; // Nomor WhatsApp tujuan
          let message = `Nama: ${nama}\nNISN: ${nisn}`;

          if (selectedStatus === 'Izin') {
            message += `\nAlasan Izin:`;
          } else if (selectedStatus === 'Sakit') {
            message += `\nKeterangan: Sakit\n*Harap melampirkan bukti surat sakit dari dokter, jika dalam 24 jam tidak melampirkan maka akan dianggap alfa.*`;
          }

          const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          const supported = await Linking.canOpenURL(whatsappURL);

          if (supported) {
            await Linking.openURL(whatsappURL);
          } else {
            Alert.alert('Kesalahan', 'Tidak dapat membuka WhatsApp.');
          }
        }
      } catch (error) {
        console.error('Kesalahan saat mengirim data:', error);
        Alert.alert('Kesalahan', 'Gagal mengirim data. Silakan coba lagi.');
      }
      return;
    }

    // Logika untuk Hadir
    if (selectedStatus === 'Hadir') {
      try {
        const koordinatSekarang = `${currentLocation.latitude}, ${currentLocation.longitude}`;
        const responsToken = await axios.get('http://192.168.1.10:8000/api/generate-token');
        const token = responsToken.data.token;

        const data = {
          nisn: nisn,
          status: 'h', // 'h' untuk Hadir
          koordinat: koordinatSekarang,
        };

        const respons = await axios.post('http://192.168.1.10:8000/api/absensi', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (respons.data) {
          Alert.alert('Berhasil', 'Absen Hadir berhasil.');
        }
      } catch (error) {
        console.error('Kesalahan saat mengirim data Hadir:', error);
        Alert.alert('Kesalahan', 'Gagal mengirim data Hadir. Silakan coba lagi.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={currentLocation}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="Lokasi Anda"
        />
      </MapView>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue) => setSelectedStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Pilih Kehadiran" value="" />
          <Picker.Item label="Hadir" value="Hadir" />
          <Picker.Item label="Sakit" value="Sakit" />
          <Picker.Item label="Izin" value="Izin" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Kirim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2948',
    padding: 20,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  pickerContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
