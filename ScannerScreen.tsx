import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, StyleSheet, Alert } from "react-native";
import { 
  Camera, 
  useCameraDevice, 
  useCodeScanner, 
  useCameraPermission 
} from "react-native-vision-camera";

const ScannerScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isScanning, setIsScanning] = useState(true); // برای جلوگیری از اسکن رگباری

  // ✅ در نسخه 4 نحوه گرفتن دیوایس این شکلی است
  const device = useCameraDevice('back');

  useEffect(() => {
    requestPermission();
  }, []);

  // ✅ تعریف اسکنر با متد جدید و سریع V4
  const codeScanner = useCodeScanner({
    // نکته سرعت: فقط کدهایی که نیاز دارید را فعال کنید
    codeTypes: ['qr', 'ean-13', 'upc-a'], 
    onCodeScanned: (codes) => {
      if (!isScanning) return;

      for (const code of codes) {
        if (code.value) {
          setIsScanning(false); // توقف اسکن موقت
          
          // ویبره یا صدا هم می‌توانید اینجا اضافه کنید
          console.log(`Scanned: ${code.value}`);
          
          Alert.alert(
            "بارکد شناسایی شد", 
            `مقدار: ${code.value}`,
            [
              { 
                text: "تایید", 
                onPress: () => {
                  setModalVisible(false);
                  setIsScanning(true); // آماده‌سازی برای دفعه بعد
                } 
              }
            ]
          );
          break; // اولین کد کافیست
        }
      }
    },
  });

  if (!device) return <Text style={styles.centerText}>دوربین یافت نشد</Text>;
  if (!hasPermission) return <Text style={styles.centerText}>نیاز به دسترسی دوربین</Text>;

  return (
    <View style={styles.container}>
      <Button
        title="باز کردن بارکدخوان"
        onPress={() => {
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
            isActive={modalVisible} // دوربین فقط وقتی مودال باز است فعال باشد
            
            // ✅ اتصال اسکنر به این روش انجام می‌شود (نه frameProcessor)
            codeScanner={codeScanner}
            
            // ✅ روشن کردن زوم برای فوکوس راحت‌تر روی بارکد
            enableZoomGesture={true}
          />
          
          {/* کادر راهنما */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.text}>
              بارکد را در کادر قرار دهید
            </Text>
            <Button
              title="بستن"
              color="red"
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
  centerText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#00FF00", // رنگ سبز برای کادر
    backgroundColor: "transparent",
    marginBottom: 20,
    borderRadius: 10
  },
  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5
  },
});