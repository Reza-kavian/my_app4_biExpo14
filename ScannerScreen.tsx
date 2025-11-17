import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, StyleSheet, Alert } from "react-native";
import { Camera, useCameraDevices, getCameraDevice } from "react-native-vision-camera";
import { useBarcodeScanner, BarcodeScanner } from "@mgcrea/vision-camera-barcode-scanner";

const ScannerScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null);

  // گرفتن دستگاه‌های دوربین
  const devices = useCameraDevices();
  const device = getCameraDevice(devices, 'back');

  // دسترسی به دوربین
  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "authorized" || status === "granted");
    };
    requestPermission();
  }, []);

  // Barcode scanner hook
  const scanner: BarcodeScanner = useBarcodeScanner({
    onBarcodesDetected: (barcodes) => {
      if (barcodes.length > 0) {
        const code = barcodes[0];
        const value = code.displayValue || code.rawValue;
        const type = code.format;
        setBarcodeValue(value);
        Alert.alert("بارکد شناسایی شد", `متن: ${value} (نوع: ${type})`);
        setModalVisible(false);
      }
    },
  });

  if (!device) return <Text>در حال بارگذاری دوربین...</Text>;
  if (!hasPermission) return <Text>نیاز به دسترسی دوربین دارید</Text>;

  return (
    <View style={styles.container}>
      <Button
        title="باز کردن بارکدخوان"
        onPress={() => setModalVisible(true)}
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
            torch="on"
            zoom={1.5}
            frameProcessor={scanner.frameProcessor}
            frameProcessorFps={10}
          />
          <View style={styles.overlay}>
            <Text style={styles.text}>
              بارکد را جلوی دوربین ببرید
            </Text>
            <Button
              title="بستن"
              onPress={() => setModalVisible(false)}
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
