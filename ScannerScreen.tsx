import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, StyleSheet, Alert } from "react-native";
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  type CodeScanner,
} from "react-native-vision-camera";

const ScannerScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // گرفتن دستگاه‌های دوربین
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  // درخواست دسترسی دوربین
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const status = await Camera.requestCameraPermission();
        Alert.alert('Permission status:', status); // debug: بعد از تست حذف کن
        setHasPermission(status === 'authorized' || status === 'granted');
        if (status !== 'authorized' && status !== 'granted') {
          Alert.alert('دسترسی رد شد', 'لطفاً دسترسی دوربین را از تنظیمات اپ فعال کنید.');
        }
      } catch (error) {
        console.error('Permission request error:', error);
        setHasPermission(false);
      }
    };
    requestPermission();
  }, []);

  // Code Scanner hook (فیکس: pdf417 حذف شد، فرمت‌های ساپورت‌شده)
  const codeScanner: CodeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],  // pdf417 حذف شد – این‌ها روی Android/iOS کار می‌کنن
    onCodeScanned: (codes) => {
      if (codes.length > 0 && !barcodeValue) {
        const value = codes[0].value;
        setBarcodeValue(value);
        setIsScanning(false);
        Alert.alert("بارکد شناسایی شد", `متن بارکد: ${value}`);
      }
    },
  });

  // بررسی وجود دوربین و دسترسی
  if (devices === null) return <Text>در حال بارگذاری دوربین...</Text>;
  if (!device) return <Text>دوربین پیدا نشد</Text>;
  if (!hasPermission) return <Text>نیاز به دسترسی دوربین دارید</Text>;

  return (
    <View style={styles.container}>
      <Button
        title="باز کردن بارکدخوان"
        onPress={() => {
          setBarcodeValue(null);
          setIsScanning(true);
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
            frameProcessorFps={5}
            codeScanner={isScanning ? codeScanner : undefined}
          />
          <View style={styles.overlay}>
            <Text style={styles.text}>
              دوربین فعال است، بارکد را جلوی دوربین ببرید
            </Text>
            <Button
              title="بستن"
              onPress={() => {
                setModalVisible(false);
                setIsScanning(true);
              }}
            />
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
});