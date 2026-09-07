import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import SorteioScreen from '../screens/SorteioScreen';
import JogadoresScreen from '../screens/JogadoresScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import PerfilScreen from '../screens/PerfilScreen';
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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabel: LABELS[route.name],
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Sorteio" component={SorteioScreen} />
      <Tab.Screen name="Jogadores" component={JogadoresScreen} />
      <Tab.Screen name="Historico" component={HistoricoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
