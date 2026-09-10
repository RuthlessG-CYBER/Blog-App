import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/api';
import { useTheme } from '../src/utils/theme';

export default function ConnectionsScreen() {
  const { userId, type } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get(`/users/${userId}/${type}`);
        setUsers(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId && type) {
      fetchConnections();
    }
  }, [userId, type]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row items-center p-4 border-b border-surface-container"
      onPress={() => router.push(`/user/${item.id}` as any)}
    >
      <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center overflow-hidden border border-primary/10 mr-4">
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Text className="text-primary font-bold text-lg">{item.name?.charAt(0) || 'U'}</Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-on-surface text-base">{item.name}</Text>
        <Text className="text-secondary text-sm">@{item.username || item.name?.toLowerCase().replace(/\s/g, '')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center px-4 py-4 border-b border-surface-container">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface capitalize">
          {type === 'followers' ? 'Followers' : 'Following'}
        </Text>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-secondary">No users found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
