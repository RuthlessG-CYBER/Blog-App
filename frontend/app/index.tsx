import React, { useEffect, useRef } from "react";
import { useTheme } from '../src/utils/theme';
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAppSelector } from "../src/store/hooks";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreenComponent() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, isFirstLaunch } = useAppSelector((state) => state.auth);

  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

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
  }, [isAuthenticated, isFirstLaunch, router]);

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
                source="https://lh3.googleusercontent.com/aida/AEtjO1U7I2Vc5W_R7nT96qth7L8pnfB21P4biOWJ4NFp6uh3u8OB2K-jpHApz8zmy2ARUyoiOyBTBMcmu79858ZtUxqEIxMaytTfqlBBIwuTbSReNkc3Cm0EjqdJlAu1clt_QU1M3J9G9mHpbL9hO-RXootdZfskK9PICwAmanQ-NAHHII7c2zNkIsfPK8FPsIgbv-WOBFZbdG_rVLoxmjP7VZqxfmQLlLDTpEn3LAcuUl6vIieajj01WekoiA"
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
