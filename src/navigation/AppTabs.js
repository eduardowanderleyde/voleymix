import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import SorteioScreen from '../screens/SorteioScreen';
import JogadoresScreen from '../screens/JogadoresScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AppHeader from '../components/AppHeader';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Sorteio: '🔀',
  Jogadores: '🏐',
  Historico: '📋',
  Perfil: '👤',
};

const LABELS = {
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
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.navy,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
      })}
    >
        <Tab.Screen name="Sorteio" component={SorteioScreen} />
        <Tab.Screen name="Jogadores" component={JogadoresScreen} />
        <Tab.Screen name="Historico" component={HistoricoScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </View>
  );
}
