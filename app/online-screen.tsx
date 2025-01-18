import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
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
  const [isMapReady, setIsMapReady] = useState(false); // Flag to track if map is ready
  const { routes } = useRootNavigationState();
  const [show, setShow] = useState(false);
  const { params } = routes[0];
  const {nisn,koordinat} = params


  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Izin Ditolak',
          'Izin lokasi diperlukan untuk menggunakan fitur ini.'
        );
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

  const handleMapReady = () => {
    setIsMapReady(true);
    getCurrentLocation(); // Ensure the map is refreshed with the current location
  };

  const handleSubmit = async() => {
    if (!selectedStatus) {
      Alert.alert('Kesalahan', 'Harap pilih status kehadiran Anda.');
      return;
    }
    if(selectedStatus==='Hadir'){
      const response = await axios.get('http://192.168.1.10:8000/api/cek-jam')
      if(response.data.isValid===false){
        Alert.alert('Kesalahan', 'Sesi absen telah berakhir.');
        return
      }
    const koordinatSekarang =`${currentLocation.latitude}, ${currentLocation.longitude}`
    const jarak = await axios.get(`https://script.google.com/macros/s/AKfycbyHHxB_PvxnD8g_o2OilYjuQusYR0KlpqrdKQ02XbGMAL4l46tXbc7iagqXfSYjZ4EGHw/exec?action=hitung-jarak&asal=${koordinatSekarang}&tujuan=${koordinat}`)
    if(jarak.data.values>=10){
       Alert.alert('Kesalahan', 'Absen harus di rumah sendiri.');
       return
    }
    const data = {
      nisn: params.nisn,
      status: 'h',
      koordinat: koordinatSekarang,
    };

    const responsToken = await axios.get('http://192.168.1.10:8000/api/generate-token')
    const token = responsToken.data.token
    const respons = await axios.post('http://192.168.1.10:8000/api/absensi', data, { headers: { Authorization: `Bearer ${token}` } });
    if (respons.data) {
      alert('Berhasil absen');
    }
    }
  };

  return (
    <View style={styles.container}>
      {/* Peta */}
      <MapView
        style={styles.map}
        region={currentLocation}
        showsUserLocation={true}
        onMapReady={handleMapReady} // Ensure the map is refreshed when ready
      >
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="Lokasi Anda"
        />
      </MapView>

      {/* Menu Dropdown */}
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

      {/* Tombol Kirim */}
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
