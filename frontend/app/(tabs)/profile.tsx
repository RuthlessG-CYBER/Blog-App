import React, { useEffect, useState } from "react";
import { useTheme } from '../../src/utils/theme';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { logoutUser } from "../../src/store/slices/authSlice";
import { fetchPosts, deletePost, toggleLikePost, fetchSavedPosts, toggleSavePost } from "../../src/store/slices/postSlice";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { posts: allPosts, savedPosts, loading } = useAppSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState<'Stories' | 'Saved'>('Stories');

  useEffect(() => {
    if (activeTab === 'Stories') {
      dispatch(fetchPosts());
    } else {
      dispatch(fetchSavedPosts());
    }
  }, [dispatch, activeTab]);

  const userPosts = allPosts.filter((post: any) => post.userId === user?.id);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutUser());
            router.replace("/(auth)/login" as any);
          },
        },
      ],
    );
  };

  const handlePostAction = (item: any) => {
    const hoursSinceCreation = (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
    const isEditable = hoursSinceCreation <= 3;

    const options: any[] = [];
    
    if (isEditable) {
      options.push({
        text: 'Edit',
        onPress: () => router.push(`/edit-note?id=${item.id}` as any)
      });
    } else {
      options.push({
        text: 'Edit (Locked > 3h)',
        onPress: () => Toast.show({ type: 'error', text1: 'Locked', text2: 'Posts can only be edited within 3 hours of creation.', position: 'bottom' }),
        style: 'cancel'
      });
    }

    options.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Delete Story', 'Are you sure you want to permanently delete this story?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => dispatch(deletePost(item.id)) }
        ]);
      }
    });

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Manage Story', 
      'Disclaimer: Stories can only be edited within 3 hours of publishing. Deletions are permanent.', 
      options
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Top Profile Action Bar */}
      <View className="w-full px-margin-mobile py-space-sm flex-row items-center justify-between border-b border-surface-container">
        <View className="flex-row items-center gap-space-xs">
          <View className="flex-row items-center gap-1">
            <Text className="text-xl font-bold text-on-surface">
              @{user?.name?.toLowerCase().replace(/\s/g, "")}
            </Text>
            <View className="w-2 h-2 rounded-full bg-primary" />
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center bg-surface-container"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Identity & Bio Section */}
        <View className="px-margin-mobile pb-space-md pt-space-md">
          <View className="flex-row items-start justify-between gap-space-md">
            <View className="relative">
              <View className="w-20 h-20 rounded-full p-[2px] bg-primary-container/20 items-center justify-center">
                <View className="w-full h-full rounded-full bg-surface-container items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                  ) : (
                    <Text className="text-3xl text-primary font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View className="flex-1 flex-row items-center justify-between">
              <View className="mt-space-sm">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-2xl font-bold text-on-surface">
                    {user?.name}
                  </Text>
                  <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                </View>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-secondary text-sm">{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="flex-row items-center gap-1.5 px-space-sm py-1 rounded-md bg-surface-container" 
                activeOpacity={0.7}
                onPress={() => router.push('/edit-profile')}
              >
                <Ionicons name="pencil" size={12} color={theme.secondary} />
                <Text className="text-on-surface font-medium text-sm">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="mt-space-md text-on-surface leading-relaxed text-base">
            {user?.bio || "Writing daily reflections on craft, quiet habits, and urban life."}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-margin-mobile mb-space-md mt-space-sm">
          <View className="flex-row bg-surface-container-low rounded-xl py-space-sm px-space-xs">
            <View className="flex-1 items-center justify-center py-1 border-r border-surface-container">
              <Text className="text-xl font-bold text-on-surface">
                {user?.postsCount || 0}
              </Text>
              <Text className="text-xs text-secondary mt-1">Stories</Text>
            </View>
            <View className="flex-1 items-center justify-center py-1 border-r border-surface-container">
              <Text className="text-xl font-bold text-on-surface">{user?.followersCount || 0}</Text>
              <Text className="text-xs text-secondary mt-1">Followers</Text>
            </View>
            <View className="flex-1 items-center justify-center py-1">
              <Text className="text-xl font-bold text-on-surface">{user?.followingCount || 0}</Text>
              <Text className="text-xs text-secondary mt-1">Following</Text>
            </View>
          </View>
        </View>

        {/* Segmented Tabs */}
        <View className="w-full bg-surface border-b border-surface-container">
          <View className="flex-row items-center w-full">
            <TouchableOpacity onPress={() => setActiveTab('Stories')} className={`flex-1 items-center py-space-sm border-b-2 ${activeTab === 'Stories' ? 'border-primary' : 'border-transparent'}`}>
              <Text className={`font-medium text-sm ${activeTab === 'Stories' ? 'text-primary' : 'text-secondary'}`}>
                Stories ({user?.postsCount || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Saved')} className={`flex-1 items-center py-space-sm border-b-2 ${activeTab === 'Saved' ? 'border-primary' : 'border-transparent'}`}>
              <Text className={`font-medium text-sm ${activeTab === 'Saved' ? 'text-primary' : 'text-secondary'}`}>
                Saved ({savedPosts?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="pb-8 pt-4">
          {loading && (activeTab === 'Stories' ? userPosts : savedPosts).length === 0 ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : (activeTab === 'Stories' ? userPosts : savedPosts).length > 0 ? (
            (activeTab === 'Stories' ? userPosts : savedPosts).map((item: any, index: number) => (
              <View key={item.id} className="px-margin-mobile">
                <TouchableOpacity
                  className={`py-space-md ${index !== (activeTab === 'Stories' ? userPosts : savedPosts).length - 1 ? "border-b border-surface-container" : ""}`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-xs text-secondary font-medium tracking-wider uppercase">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    <TouchableOpacity onPress={() => handlePostAction(item)} className="p-2 -mr-2">
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={16}
                        color={theme.outlineVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">
                    {item.title}
                  </Text>

                  <Text
                    className="text-on-surface-variant text-[15px] leading-relaxed mb-4"
                    numberOfLines={3}
                  >
                    {item.content}
                  </Text>

                  {item.imageUrl && (
                    <View className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-surface-container shadow-sm border border-outline-variant/20">
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
                          <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={theme.outline}
                          />
                          <Text className="text-xs text-secondary">{item.commentsCount || 0}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => dispatch(toggleSavePost(item.id) as any)}>
                      <Ionicons
                        name={item.isSaved ? "bookmark" : "bookmark-outline"}
                        size={16}
                        color={item.isSaved ? theme.primary : theme.outlineVariant}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="px-margin-mobile py-space-xl items-center justify-center">
              <Text className="text-secondary text-sm">
                More stories will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
