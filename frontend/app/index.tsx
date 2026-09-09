import React, { useEffect, useState } from "react";
import { useTheme } from '../src/utils/theme';
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAppSelector } from "../src/store/hooks";

export default function SplashScreenComponent() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, isFirstLaunch } = useAppSelector((state) => state.auth);

  const [logoScale] = useState(() => new Animated.Value(0.5));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [loaderOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // 1. Logo Popup Animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 10,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Fade in loading indicator after logo pops
    const loaderTimer = setTimeout(() => {
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 800);

    // 3. Routing logic after total delay
    const routeTimer = setTimeout(() => {
      if (isFirstLaunch) {
        router.replace('/onboarding' as any);
      } else if (isAuthenticated) {
        router.replace('/(tabs)/home' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }, 2500);

    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(routeTimer);
    };
  }, [isAuthenticated, isFirstLaunch, router, logoScale, logoOpacity, loaderOpacity]);

  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center relative">
      <View className="flex-1 items-center justify-center">
        {/* Logo Container */}
        <Animated.View 
          style={{ 
            opacity: logoOpacity, 
            transform: [{ scale: logoScale }],
            alignItems: 'center',
            justifyContent: 'center'
          }} 
        >
          <View className="w-28 h-28 rounded-[32px] bg-surface-container-highest shadow-lg flex items-center justify-center p-1 mb-6 relative overflow-visible">
            <View className="w-full h-full rounded-[28px] overflow-hidden">
              <Image 
                source={require('@/assets/images/icon.png')}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
          </View>
          
          <Text className="text-3xl font-bold text-on-surface tracking-tight mb-2">
            Chronicle
          </Text>
        </Animated.View>
        
        {/* Loading Indicator */}
        <Animated.View style={{ opacity: loaderOpacity, marginTop: 40 }}>
          <ActivityIndicator size="small" color={theme.primary} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
