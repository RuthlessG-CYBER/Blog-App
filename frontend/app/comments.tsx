import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '../src/utils/theme';
import { getComments, addComment } from '../src/api';
import { useAppSelector } from '../src/store/hooks';
import Toast from 'react-native-toast-message';

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await getComments(postId as string);
      setComments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      const res = await addComment(postId as string, content.trim());
      setComments([res.data.data, ...comments]);
      setContent('');
      Toast.show({ type: 'success', text1: 'Comment added' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to add comment' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: any }) => (
    <View className="px-margin-mobile py-space-sm border-b border-surface-container flex-row gap-space-xs">
      <View className="w-8 h-8 rounded-full bg-surface-container overflow-hidden items-center justify-center">
        {item.user?.profileImage ? (
          <Image source={{ uri: item.user.profileImage }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text className="text-primary font-bold">{item.user?.name?.charAt(0)}</Text>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <Text className="font-semibold text-on-surface">{item.user?.name}</Text>
          <Text className="text-secondary text-xs">{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text className="text-on-surface-variant text-[15px]">{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View className="h-14 px-margin-mobile flex-row items-center border-b border-surface-container">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface">Comments</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={theme.primary} /></View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text className="text-center text-secondary mt-10">No comments yet. Be the first!</Text>}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="p-margin-mobile border-t border-surface-container flex-row items-center gap-space-xs">
          <View className="flex-1 bg-surface-container rounded-full px-4 py-2 min-h-[40px] justify-center">
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Add a comment..."
              placeholderTextColor={theme.secondary}
              className="text-on-surface w-full"
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={!content.trim() || submitting}
            className={`w-10 h-10 rounded-full items-center justify-center ${content.trim() ? 'bg-primary' : 'bg-surface-container'}`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.white} />
            ) : (
              <Ionicons name="send" size={16} color={content.trim() ? theme.white : theme.secondary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
