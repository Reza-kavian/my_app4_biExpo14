import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, StyleSheet, Alert } from "react-native";
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  getCameraDevice,
  type CodeScanner,
  BarcodeFormat,
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
        setHasPermission(status === 'authorized' || status === 'granted');
      } catch (error) {
        console.error('Permission request error:', error);
        setHasPermission(false);
      }
    };
    requestPermission();
  }, []);

  // Code Scanner hook (safe check برای codes[0])
  const codeScanner: CodeScanner = useCodeScanner({
    codeTypes: [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.CODABAR,
      BarcodeFormat.ITF,
      BarcodeFormat.UPC_E,
      BarcodeFormat.PDF_417,
      BarcodeFormat.AZTEC,
      BarcodeFormat.DATA_MATRIX,
    ],
    onCodeScanned: (codes) => {
      console.log('Detected codes length:', codes.length); // debug
      Alert.alert('Debug Detection', `تعداد codes: ${codes.length}`); // موقت – بعد حذف کن

      if (codes.length > 0) {
        const code = codes[0]; // safe access
        if (code && code.value) { // check undefined
          const value = code.value;
          const type = code.type; // type مثل QR_CODE
          console.log('Detected value:', value, 'Type:', type); // debug
          setBarcodeValue(value);
          setIsScanning(false);
          Alert.alert("بارکد شناسایی شد", `متن: ${value} (نوع: ${type})`);
        } else {
          Alert.alert('Debug', 'Code object undefined or no value');
        }
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
            frameProcessorFps={15}
            codeScanner={isScanning ? codeScanner : undefined}
          />
          <View style={styles.overlay}>
            <Text style={styles.text}>
              دوربین فعال است، بارکد را جلوی دوربین ببرید (QR/EAN تست کن، ۱۰ ثانیه صبر کن)
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