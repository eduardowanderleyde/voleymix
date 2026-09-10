import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import ToastHost from './src/components/ToastHost';

export default function App() {
  return (
    <>
      <RootNavigator />
      <ToastHost />
      <StatusBar style="auto" />
    </>
  );
}
