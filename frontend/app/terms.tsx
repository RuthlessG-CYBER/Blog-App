import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/utils/theme';

export default function TermsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-margin-mobile py-4 border-b border-outline-variant">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="font-sans text-lg font-bold text-on-surface">Terms of Service</Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xl font-bold text-on-surface mb-4">Welcome to Chronicle</Text>
        
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of Chronicle&apos;s mobile application, website, and services (collectively, the &quot;Services&quot;). Please read these Terms carefully before using our Services.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">1. Acceptance of Terms</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">2. User Content</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          You retain all rights and ownership to the content you create, post, or share on Chronicle. However, by providing content to the Services, you grant Chronicle a worldwide, non-exclusive, royalty-free license to use, copy, modify, distribute, and display that content in connection with providing and operating the Services.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">3. Acceptable Use</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          You agree not to use the Services in any way that violates applicable laws or regulations, infringes upon the rights of others, or interferes with the operation of the Services. We reserve the right to remove any content or suspend any account that violates these Terms.
        </Text>

        <Text className="font-sans text-lg font-semibold text-on-surface mt-6 mb-2">4. Termination</Text>
        <Text className="font-sans text-base text-secondary mb-4 leading-relaxed">
          We may terminate or suspend your access to the Services at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </Text>

        <Text className="font-sans text-base text-secondary mt-8 italic text-center">
          Last updated: September 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
