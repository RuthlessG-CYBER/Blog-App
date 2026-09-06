import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/utils/theme';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchNotifications, markNotificationsAsRead } from '../src/store/slices/notificationSlice';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    
    return () => {
      dispatch(markNotificationsAsRead());
    };
  }, [dispatch]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className={`flex-row items-start gap-4 px-margin-mobile py-4 border-b border-surface-container ${!item.isRead ? 'bg-primary-container/10' : ''}`}>
      <View className="relative">
        <View className="w-12 h-12 rounded-full overflow-hidden bg-surface-container items-center justify-center">
          {item.actor.profileImage ? (
            <Image source={{ uri: item.actor.profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Text className="text-xl font-bold text-primary">{item.actor.name.charAt(0)}</Text>
          )}
        </View>
        <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-error items-center justify-center border-2 border-surface">
          <Ionicons name="heart" size={10} color={theme.white} />
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-on-surface text-[15px] leading-relaxed">
          <Text className="font-bold">{item.actor.name}</Text> liked your post 
          {item.post ? <Text className="font-semibold text-primary"> &quot;{item.post.title}&quot;</Text> : ' (deleted post)'}
        </Text>
        <Text className="text-secondary text-xs mt-1">
          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      {!item.isRead && (
        <View className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-[60px] px-margin-mobile flex-row items-center border-b border-surface-container">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full bg-surface-container"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-on-surface ml-2">Notifications</Text>
      </View>
      
      {loading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-8">
              <Ionicons name="notifications-off-outline" size={48} color={theme.outline} />
              <Text className="text-lg font-semibold text-on-surface mt-4">No notifications yet</Text>
              <Text className="text-center text-secondary mt-2">
                When someone likes or interacts with your posts, you&apos;ll see it here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
