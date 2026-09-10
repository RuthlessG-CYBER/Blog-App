import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/api';
import { useTheme } from '../../src/utils/theme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/auth/user/${id}`);
        setUserProfile(response.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center px-6 py-4 border-b border-surface-container">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="font-sans text-lg font-bold text-on-surface">Profile</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-6">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-primary-container items-center justify-center overflow-hidden mb-4 border border-primary/20">
              {userProfile?.profileImage ? (
                <Image source={{ uri: userProfile.profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text className="text-3xl font-bold text-primary">{userProfile?.name?.charAt(0) || 'U'}</Text>
              )}
            </View>
            <Text className="font-sans text-2xl font-bold text-on-surface mb-1">{userProfile?.name || 'User Profile'}</Text>
            <Text className="font-sans text-base text-secondary">@{userProfile?.username || userProfile?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</Text>
          </View>
          <View className="flex-row items-center justify-center gap-6 mb-8">
            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push(`/connections?userId=${userProfile?.id}&type=followers`)}
            >
              <Text className="font-bold text-xl text-on-surface">{userProfile?.followersCount || 0}</Text>
              <Text className="text-secondary text-sm">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push(`/connections?userId=${userProfile?.id}&type=following`)}
            >
              <Text className="font-bold text-xl text-on-surface">{userProfile?.followingCount || 0}</Text>
              <Text className="text-secondary text-sm">Following</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="font-bold text-xl text-on-surface">{userProfile?.postsCount || 0}</Text>
              <Text className="text-secondary text-sm">Posts</Text>
            </View>
          </View>
          <View className="bg-surface-container rounded-xl p-4">
             <Text className="text-on-surface-variant text-center">User details are visible because they follow you!</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
