import "../global.css";
import { useTheme } from '../src/utils/theme';
import { Stack, useRouter, useSegments , ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAppDispatch, useAppSelector } from "../src/store/hooks";
import { fetchMe, setFirstLaunch, setLoading } from "../src/store/slices/authSlice";
import { View, useColorScheme } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import * as SystemUI from 'expo-system-ui';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { 
  useFonts, 
  Saira_400Regular, 
  Saira_500Medium, 
  Saira_600SemiBold, 
  Saira_700Bold, 
  Saira_800ExtraBold 
} from '@expo-google-fonts/saira';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, loading, isFirstLaunch } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Saira_400Regular,
    Saira_500Medium,
    Saira_600SemiBold,
    Saira_700Bold,
    Saira_800ExtraBold,
  });

  useEffect(() => {
    const checkAppInit = async () => {
      try {
        const firstLaunch = await SecureStore.getItemAsync('hasLaunched');
        if (firstLaunch === null) {
          dispatch(setFirstLaunch(true));
          await SecureStore.setItemAsync('hasLaunched', 'true');
        } else {
          dispatch(setFirstLaunch(false));
        }
        
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          await dispatch(fetchMe());
        } else {
          dispatch(setLoading(false));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };
    checkAppInit();
  }, [dispatch]);

  useEffect(() => {
    if (!isReady || loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isOnboarding = segments[0] === 'onboarding';
    const isSplash = (segments as string[]).length === 0;

    // Do not auto-redirect if we are on the custom splash screen.
    // The index.tsx will handle its own animation and then redirect.
    if (isSplash) return;

    // Use setTimeout to ensure the layout has mounted before replacing routes
    setTimeout(() => {
      if (isAuthenticated) {
        // If logged in, protect them from Auth or Onboarding screens
        if (inAuthGroup || isOnboarding) {
          router.replace('/(tabs)/home' as any);
        }
      } else {
        // If not logged in
        if (isFirstLaunch && !inAuthGroup && !isOnboarding) {
          router.replace('/onboarding' as any);
        } else if (!isFirstLaunch && !inAuthGroup && !isOnboarding) {
          router.replace('/(auth)/login' as any);
        }
      }
    }, 0);
  }, [isAuthenticated, isFirstLaunch, loading, isReady, segments, router]);

  const theme = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);



  if (!isReady || loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }} />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 600, headerShown: false }} />
      <Stack.Screen name="add-note" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
      <Stack.Screen name="edit-note" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
      <Stack.Screen name="terms" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
      <Stack.Screen name="privacy" options={{ presentation: 'transparentModal', animation: 'slide_from_right', headerShown: false }} />
    </Stack>
  );
}


export default function RootLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
    },
  };
  
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.primary, backgroundColor: theme.surfaceContainer }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: 'Saira_700Bold',
          color: theme.onSurface
        }}
        text2Style={{
          fontSize: 13,
          fontFamily: 'Saira_500Medium',
          color: theme.secondary
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: theme.error, backgroundColor: theme.surfaceContainer }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: 'Saira_700Bold',
          color: theme.onSurface
        }}
        text2Style={{
          fontSize: 13,
          fontFamily: 'Saira_500Medium',
          color: theme.secondary
        }}
      />
    )
  };

  return (
    <Provider store={store}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RootLayoutNav />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </Provider>
  );
}
