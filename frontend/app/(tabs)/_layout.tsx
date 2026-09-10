import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Platform } from 'react-native';
import { useTheme } from '../../src/utils/theme';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  
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
        },
        tabBarButton: (props) => <TouchableOpacity {...props as any} activeOpacity={0.8} />
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarButton: (props) => (
            <TouchableOpacity 
              {...props as any}
              onPress={() => router.push('/add-note')}
              activeOpacity={0.8}
            >
              <View style={{
                top: Platform.OS === 'ios' ? -10 : -15,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: theme.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <Ionicons name="add" size={32} color={theme.onPrimary} />
              </View>
            </TouchableOpacity>
          ),
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
