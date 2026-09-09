import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import SessoesScreen from '../screens/SessoesScreen';
import SorteioScreen from '../screens/SorteioScreen';
import JogadoresScreen from '../screens/JogadoresScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AppHeader from '../components/AppHeader';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Sessoes: 'calendar',
  Sorteio: 'shuffle',
  Jogadores: 'users',
  Historico: 'clipboard',
  Perfil: 'user',
};

const LABELS = {
  Sessoes: 'Sessões',
  Sorteio: 'Sorteio',
  Jogadores: 'Jogadores',
  Historico: 'Histórico',
  Perfil: 'Perfil',
};

export default function AppTabs() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ focused, color }) => (
          <View style={[iconStyles.wrap, focused && iconStyles.wrapAtivo]}>
            <Feather name={ICONS[route.name]} size={18} color={color} />
          </View>
        ),
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: colors.navy,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
      })}
    >
        <Tab.Screen name="Sessoes" component={SessoesScreen} />
        <Tab.Screen name="Sorteio" component={SorteioScreen} />
        <Tab.Screen name="Jogadores" component={JogadoresScreen} />
        <Tab.Screen name="Historico" component={HistoricoScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { width: 40, height: 26, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wrapAtivo: { backgroundColor: colors.oceanTint },
});
