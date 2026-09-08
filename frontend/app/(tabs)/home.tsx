import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../src/utils/theme';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchPosts, fetchDiscoverPosts, fetchFollowingPosts, toggleLikePost, updateFollowState } from '../../src/store/slices/postSlice';
import { toggleFollow } from '../../src/api';
import { fetchMe } from '../../src/store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { posts, discoverPosts, followingPosts, loading } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  const flatListRef = useRef<FlatList>(null);

  const handleFollow = async (targetUserId: string, currentIsFollowing: boolean) => {
    // Optimistic UI update
    dispatch(updateFollowState({ targetUserId, isFollowing: !currentIsFollowing }));
    try {
      const res = await toggleFollow(targetUserId);
      dispatch(updateFollowState({ targetUserId, isFollowing: res.data.data.isFollowing }));
      dispatch(fetchMe()); // Refresh user profile to update following count in background
    } catch (error) {
      // Revert on error
      dispatch(updateFollowState({ targetUserId, isFollowing: currentIsFollowing }));
    }
  };
  const lastTabPress = useRef(0);
  const [activeTab, setActiveTab] = useState<'Following' | 'Discover' | 'Routine'>('Discover');

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      const now = Date.now();
      if (now - lastTabPress.current < 400) {
        // Double tap detected!
        fetchDataForTab(activeTab);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
      lastTabPress.current = now;
    });

    return unsubscribe;
  }, [navigation, dispatch, activeTab]);



  const renderItem = ({ item }: { item: any }) => (
    <View className="px-margin-mobile">
      <TouchableOpacity 
        className="py-space-md border-b border-surface-container"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between mb-space-sm">
          <View className="flex-row items-center gap-space-xs">
            <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center overflow-hidden border border-outline-variant/30">
              {item.user?.profileImage ? (
                <Image 
                  source={{ uri: item.user.profileImage }} 
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover" 
                  transition={200}
                />
              ) : (
                <Text className="text-primary font-bold text-lg">{item.user?.name?.charAt(0) || 'U'}</Text>
              )}
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="font-semibold text-on-surface">{item.user?.name || 'Unknown'}</Text>
                <Text className="text-secondary text-xs">@{item.user?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</Text>
              </View>
              <Text className="text-secondary text-xs mt-0.5">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {item.user?.id !== user?.id && (
              <TouchableOpacity 
                onPress={() => handleFollow(item.user.id, item.isFollowing)}
                className={`px-3 py-1 rounded-full ${item.isFollowing ? 'bg-surface-container border border-outline-variant' : 'bg-primary'}`}
              >
                <Text className={`text-xs font-semibold ${item.isFollowing ? 'text-on-surface' : 'text-on-primary'}`}>
                  {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">{item.title}</Text>
        
        <Text className="text-on-surface-variant text-[15px] leading-relaxed mb-4" numberOfLines={3}>
          {item.content}
        </Text>

        {item.imageUrl && (
          <View className="w-full h-48 rounded-xl overflow-hidden mb-4 bg-surface-container shadow-sm border border-outline-variant/20">
            <Image 
              source={{ uri: item.imageUrl }} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover" 
              transition={200}
            />
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-space-lg">
            <TouchableOpacity 
              className="flex-row items-center gap-1.5"
              onPress={() => dispatch(toggleLikePost(item.id) as any)}
            >
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={item.isLiked ? theme.error : theme.outline} 
              />
              <Text className={`text-xs ${item.isLiked ? 'text-error font-medium' : 'text-secondary'}`}>
                {item.likesCount || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => router.push(`/comments?postId=${item.id}` as any)}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.outline} />
              <Text className="text-xs text-secondary">{item.commentsCount || 0}</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="bookmark-outline" size={16} color={theme.outlineVariant} />
        </View>
      </TouchableOpacity>
    </View>
  );

    const renderHeader = () => (
    <View className="pt-space-md pb-space-sm">
      <View className="px-margin-mobile flex-row items-center justify-between mb-space-sm">
        <Text className="text-xs uppercase tracking-wider text-secondary font-semibold">Chronicle Stream</Text>
      </View>
      
      <View className="px-margin-mobile flex-row items-center gap-space-xs mb-space-sm pb-1 overflow-visible">
        <TouchableOpacity 
          onPress={() => setActiveTab('Following')}
          className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full ${activeTab === 'Following' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
        >
          {activeTab === 'Following' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={`font-medium text-sm ${activeTab === 'Following' ? 'text-on-primary' : 'text-secondary'}`}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Discover')}
          className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full ${activeTab === 'Discover' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
        >
          {activeTab === 'Discover' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={`font-medium text-sm ${activeTab === 'Discover' ? 'text-on-primary' : 'text-secondary'}`}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Routine')}
          className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full ${activeTab === 'Routine' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}`}
        >
          {activeTab === 'Routine' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={`font-medium text-sm ${activeTab === 'Routine' ? 'text-on-primary' : 'text-secondary'}`}>Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const [isInitialDelay, setIsInitialDelay] = useState(true);
  
  const fetchDataForTab = (tab: string) => {
    if (tab === 'Discover') dispatch(fetchDiscoverPosts());
    else if (tab === 'Following') dispatch(fetchFollowingPosts());
    else if (tab === 'Routine') dispatch(fetchPosts());
  };

  useEffect(() => {
    if (!isInitialDelay) {
      fetchDataForTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    // Wait 3 seconds before making the initial fetch to reduce server load
    const timer = setTimeout(() => {
      fetchDataForTab(activeTab);
      setIsInitialDelay(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const showSkeleton = loading || isInitialDelay;

  const renderSkeleton = () => (
    <View className="px-margin-mobile">
      <View className="py-space-md border-b border-surface-container opacity-50">
        <View className="flex-row items-center justify-between mb-space-sm">
          <View className="flex-row items-center gap-space-xs">
            <View className="w-10 h-10 rounded-full bg-surface-container-high" />
            <View>
              <View className="w-24 h-4 bg-surface-container-high rounded mb-1" />
              <View className="w-16 h-3 bg-surface-container-high rounded" />
            </View>
          </View>
        </View>
        <View className="w-3/4 h-6 bg-surface-container-high rounded mb-2" />
        <View className="w-full h-4 bg-surface-container-high rounded mb-1" />
        <View className="w-full h-4 bg-surface-container-high rounded mb-1" />
        <View className="w-2/3 h-4 bg-surface-container-high rounded mb-4" />
        <View className="w-full h-48 rounded-xl bg-surface-container-high mb-4" />
        <View className="flex-row items-center justify-between">
          <View className="w-16 h-5 bg-surface-container-high rounded" />
          <View className="w-5 h-5 bg-surface-container-high rounded" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Premium Top App Bar */}
      <View className="h-[72px] px-margin-mobile flex-row items-center justify-between border-b border-surface-container/50 bg-surface">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-xl overflow-hidden items-center justify-center">
            <Image 
              source={require('../../assets/images/logo-bw.png')}
              style={{ width: 32, height: 32, borderRadius: 12 }}
              contentFit="contain"
            />
          </View>
          <Text className="text-[26px] font-extrabold text-on-surface tracking-tighter" style={{ letterSpacing: -1 }}>
            Chronicle
          </Text>
        </View>
        <View className="flex-row items-center gap-space-xs">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/30 shadow-sm active:scale-95 transition-transform"
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={showSkeleton ? [1, 2, 3] : (activeTab === 'Discover' ? discoverPosts : (activeTab === 'Following' ? followingPosts : posts))}
        keyExtractor={(item) => (showSkeleton ? item.toString() : item.id)}
        renderItem={showSkeleton ? renderSkeleton : renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          !showSkeleton ? (
            <View className="flex-1 items-center justify-center px-margin-mobile py-space-3xl mt-10">
              <View className="w-16 h-16 rounded-full bg-surface-container-high items-center justify-center text-primary mb-space-md">
                <Ionicons name="compass" size={28} color={theme.primary} />
              </View>
              <Text className="text-xl font-semibold text-on-surface mb-2">A Quiet World</Text>
              <Text className="text-center text-secondary mb-space-lg leading-relaxed">
                There are no stories to discover right now. Invite some friends or be the first to share your thoughts with the community.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary"
        activeOpacity={0.8}
        onPress={() => router.push('/add-note' as any)}
      >
        <Ionicons name="pencil" size={24} color={theme.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
