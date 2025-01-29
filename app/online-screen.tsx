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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRootNavigationState } from 'expo-router';

export default function AttendanceScreen() {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCooldown, setIsCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { routes } = useRootNavigationState();
  const { params } = routes[0];
  const { nisn, koordinat, nama } = params;

  useEffect(() => {
    requestLocationPermission();
    checkCooldown();
  }, []);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isCooldown) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCooldown]);

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

  const checkCooldown = async () => {
    try {
      const cooldownTime = await AsyncStorage.getItem('cooldownTime');
      if (cooldownTime) {
        const now = new Date().getTime();
        if (now < parseInt(cooldownTime, 10)) {
          const remaining = Math.ceil((parseInt(cooldownTime, 10) - now) / 1000);
          setRemainingTime(remaining);
          setIsCooldown(true);
        }
      }
    } catch (error) {
      console.error('Kesalahan saat memeriksa cooldown:', error);
    }
  };

  const handleSubmit = async () => {
    if (isCooldown) return;

    if (!selectedStatus) {
      Alert.alert('Kesalahan', 'Harap pilih status kehadiran Anda.');
      return;
    }

    const koordinatSekarang = `${currentLocation.latitude},${currentLocation.longitude}`;
    console.log('Koordinat Sekarang:', koordinatSekarang);
    console.log('Koordinat Tujuan:', koordinat);

    try {
      const response = await axios.get('http://192.168.1.10:8000/api/cek-jam');
      if (response.data.isValid === false) {
        Alert.alert('Kesalahan', 'Sesi absen telah berakhir.');
        return;
      }

     const jarakResponse = await axios.get(
  `https://script.google.com/macros/s/AKfycbynJLSI3baFpoRJp7cWwIs22b5a8VNAqaXniwmyufMGq7dwgcnPJiVpNeHLs6_Byqac3A/exec?action=hitung-jarak&asal=${koordinatSekarang}&tujuan=${koordinat}`
);

console.log("Respons API Jarak:", jarakResponse.data);


      const jarakData = jarakResponse.data;
      console.log(`Jarak dihitung: ${jarakData.values} meter`);

      if (!jarakData.response) {
        Alert.alert('Kesalahan', 'Absen tidak dapat dilakukan, tolong absen di rumah sendiri.');
        return;
      }

      if (jarakData.values >= 20) {
        Alert.alert('Kesalahan', `Absen hanya bisa dilakukan jika Anda berada di rumah sendiri (jarak = ${jarakData.values} meter).`);
        return;
      }

      const statusCode =
        selectedStatus === 'Izin' ? 'i' : selectedStatus === 'Sakit' ? 's' : 'h';
      const data = {
        nisn: nisn,
        status: statusCode,
        koordinat: koordinatSekarang,
      };

      const tokenResponse = await axios.get('http://192.168.1.10:8000/api/generate-token');
      const token = tokenResponse.data.token;

      const absensiResponse = await axios.post('http://192.168.1.10:8000/api/absensi', data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (absensiResponse.data) {
        if (selectedStatus === 'Izin' || selectedStatus === 'Sakit') {
          const phoneNumber = '+6283896064130';
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
        } else if (selectedStatus === 'Hadir') {
          Alert.alert('Berhasil', 'Absen Hadir berhasil.');
        }
      }

      const cooldownDuration = 30;
      const cooldownEndTime = new Date().getTime() + cooldownDuration * 1000;

      setIsCooldown(true);
      setRemainingTime(cooldownDuration);
      await AsyncStorage.setItem('cooldownTime', cooldownEndTime.toString());
    } catch (error) {
      console.error('Kesalahan saat mengirim data:', error);
      Alert.alert('Kesalahan', 'Gagal mengirim data. Silakan coba lagi.');
    }
  };

  return (
    <View style={styles.container}>
      {currentLocation.latitude !== 0 && currentLocation.longitude !== 0 ? (
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
      ) : (
        <Text style={styles.loadingText}>Menunggu lokasi...</Text>
      )}

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

      <TouchableOpacity
        style={[styles.button, isCooldown && { backgroundColor: '#ccc' }]}
        onPress={handleSubmit}
        disabled={isCooldown}
      >
        <Text style={styles.buttonText}>
          {isCooldown ? 'Tunggu...' : 'Kirim'}
        </Text>
      </TouchableOpacity>

      {isCooldown && (
        <Text style={styles.cooldownText}>
          Harap tunggu {remainingTime} detik sebelum mencoba lagi.
        </Text>
      )}
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
  cooldownText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
  },
  loadingText: { 
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
});
