import { Camera, useCameraPermissions, CameraView } from 'expo-camera';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Prop = {
  type: string;
  data: string;
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [storedCodes, setStoredCodes] = useState<string[]>([]);

  // Carregar os QR Codes salvos ao iniciar o app
  useEffect(() => {
    const loadStoredCodes = async () => {
      try {
        const savedCodes = await AsyncStorage.getItem('scannedCodes');
        if (savedCodes) {
          setStoredCodes(JSON.parse(savedCodes));
        }
      } catch (error) {
        console.error('Erro ao carregar os códigos armazenados:', error);
      }
    };

    loadStoredCodes();
  }, []);

  // Salvar novo QR Code escaneado
  const handleBarCodeScanned = async ({ type, data }: Prop) => {
    console.log(`Código escaneado: ${type}, Dados: ${data}`);
    setScanned(true);
    
    try {
      const updatedCodes = [...storedCodes, data];
      await AsyncStorage.setItem('scannedCodes', JSON.stringify(updatedCodes));
      setStoredCodes(updatedCodes);
    } catch (error) {
      console.error('Erro ao salvar o QR Code:', error);
    }

    Alert.alert(
      `Código ${type} Scaneado`,
      `Dados: ${data}`,
      [{ text: 'OK', onPress: () => setScanned(false) }],
      { cancelable: false }
    );
  };

  // Limpar QR Codes armazenados
  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('scannedCodes');
      setStoredCodes([]);
      Alert.alert('Dados apagados', 'Todos os QR Codes foram removidos.');
    } catch (error) {
      console.error('Erro ao limpar os dados:', error);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Permissão da câmera não concedida.</Text>
        <Button title="Solicitar Permissão" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.layerContainer}>
          <View style={styles.layerTop} />
          <View style={styles.layerCenter}>
            <View style={styles.layerLeft} />
            <View style={styles.focused} />
            <View style={styles.layerRight} />
          </View>
          <View style={styles.layerBottom} />
        </View>
      </CameraView>

      {/* Exibir códigos salvos */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>QR Codes escaneados:</Text>
        {storedCodes.length > 0 ? (
          <FlatList
            data={storedCodes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.resultText}>• {item}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noDataText}>Nenhum código armazenado</Text>
        )}

        <Button title="Limpar QR Codes" onPress={clearStorage} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  layerContainer: {
    flex: 1,
  },
  layerTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  layerCenter: {
    flexDirection: 'row',
  },
  layerLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  focused: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  layerRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  layerBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 18,
    marginVertical: 5,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
});
