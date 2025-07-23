import { Alert } from 'react-native';

export const showAlert = {
  success: (title: string, message: string) => {
    Alert.alert(`✅ ${title}`, message);
  },
  error: (title: string, message: string) => {
    Alert.alert(`❌ ${title}`, message);
  },
  warning: (title: string, message: string) => {
    Alert.alert(`⚠️ ${title}`, message);
  },
  info: (title: string, message: string) => {
    Alert.alert(`ℹ️ ${title}`, message);
  },
};
