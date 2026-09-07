import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import NovoJogadorScreen from '../screens/NovoJogadorScreen';
import PeladaDetalheScreen from '../screens/PeladaDetalheScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCarregandoAuth(false);
    });
    return unsubscribe;
  }, []);

  if (carregandoAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }}>
        <ActivityIndicator size="large" color={colors.ocean} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={AppTabs} />
            <Stack.Screen
              name="NovoJogador"
              component={NovoJogadorScreen}
              options={{ headerShown: true, title: 'Jogador' }}
            />
            <Stack.Screen
              name="PeladaDetalhe"
              component={PeladaDetalheScreen}
              options={{ headerShown: true, title: 'Detalhe da pelada' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
