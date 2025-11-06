import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, Alert } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
  CameraDevice,
} from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import {
  scanBarcodes,
  BarcodeFormat,
} from '@mgcrea/vision-camera-barcode-scanner';

const ScannerScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null);

  // گرفتن دستگاه‌های دوربین
  const devices = useCameraDevices() as unknown as {
    back?: CameraDevice;
    front?: CameraDevice;
  };
  const device = devices.back;

  // درخواست دسترسی دوربین
  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    };
    requestPermission();
  }, []);

  // Frame processor برای شناسایی بارکد
  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const barcodes = scanBarcodes(frame, [BarcodeFormat.ALL_FORMATS]);
    if (barcodes.length > 0) {
      runOnJS(handleBarcodeDetected)(barcodes[0].displayValue ?? '');
    }
  }, []);

  const handleBarcodeDetected = (value: string) => {
    if (!barcodeValue) {
      setBarcodeValue(value);
      Alert.alert('بارکد شناسایی شد', `متن بارکد: ${value}`);
      // اگر بخوای modal رو ببندی، این خط رو uncomment کن:
      // setModalVisible(false);
    }
  };

  // بررسی وجود دوربین و دسترسی
  if (!device) return <Text>دوربین پیدا نشد</Text>;
  if (!hasPermission) return <Text>نیاز به دسترسی دوربین دارید</Text>;

  return (
    <View style={styles.container}>
      <Button
        title="باز کردن بارکدخوان"
        onPress={() => {
          setBarcodeValue(null); // ریست کردن مقدار قبلی
          setModalVisible(true);
        }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={modalVisible}
            frameProcessor={frameProcessor}
          />
          <View style={styles.overlay}>
            <Text style={styles.text}>
              دوربین فعال است، بارکد را جلوی دوربین ببرید
            </Text>
            <Button title="بستن" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
});
