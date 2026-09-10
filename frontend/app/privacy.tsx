import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/utils/theme';

export default function PrivacyScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-margin-mobile py-4 border-b border-outline-variant">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="font-sans text-lg font-bold text-on-surface">Privacy Policy</Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xl font-bold text-on-surface mb-4">Privacy Policy for Chronicle</Text>
        
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          At Chronicle, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our mobile application.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">1. Information We Collect</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          We may collect information about you in a variety of ways. The information we may collect includes personal data, such as your name, email address, and profile picture, when you register for an account. We also collect the content you create and share (your notes and blogs).
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">2. Use of Your Information</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to create and manage your account, deliver targeted content, and improve our services.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">3. Disclosure of Your Information</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          We do not sell your personal information. We may share information we have collected about you in certain situations, such as to comply with legal obligations, protect our rights, or with third-party service providers that perform services for us or on our behalf.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">4. Data Security</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
        </Text>

        <Text className="font-sans text-base text-secondary mt-8 italic text-center">
          Last updated: September 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
