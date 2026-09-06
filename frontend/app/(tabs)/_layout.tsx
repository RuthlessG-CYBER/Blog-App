import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/utils/theme';

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs 
      screenOptions={{ 
        sceneStyle: { backgroundColor: theme.background },
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.surfaceContainer
        }
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
