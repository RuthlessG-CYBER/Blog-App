import React, { useState } from 'react';
import { useTheme } from '../src/utils/theme';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../src/store/hooks';
import { createPost, uploadPostImage } from '../src/store/slices/postSlice';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function AddNoteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!title || !content) {
      Toast.show({ type: 'error', text1: 'Draft Incomplete', text2: 'Title and Content are required to publish.', position: 'bottom' });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(createPost({ title, content }));
      if (createPost.fulfilled.match(resultAction)) {
        const post = resultAction.payload;
        if (image) {
          await dispatch(uploadPostImage({ postId: post.id, imageUri: image }));
        }
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to publish chronicle', position: 'bottom' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong', position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-margin-mobile py-space-sm bg-surface-container-lowest/80 border-b border-surface-container mb-space-sm">
        <View className="flex-row items-center gap-space-sm">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full items-center justify-center bg-surface-container-low"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.secondary} />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-on-surface leading-tight">New Story</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-xs text-secondary">Draft saved just now</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-space-xs">
          <TouchableOpacity 
            className="px-4 py-2 rounded-lg bg-primary items-center flex-row gap-1.5 shadow-sm"
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color={theme.onPrimary} />
                <Text className="text-on-primary font-bold text-sm">Publish</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-margin-mobile">
          
          <TextInput
            className="w-full font-bold text-3xl text-on-surface mb-space-md"
            placeholder="What's your story about?"
            placeholderTextColor={theme.secondary}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {image ? (
            <View className="relative w-full rounded-xl overflow-hidden bg-surface-container-low mb-space-md">
              <Image source={{ uri: image }} style={{ width: '100%', height: 192 }} contentFit="cover" transition={200} />
              <View className="absolute top-2 right-2 flex-row gap-2">
                <TouchableOpacity 
                  className="w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              className="w-full py-6 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant mb-space-md items-center justify-center"
              onPress={pickImage}
            >
              <View className="w-12 h-12 rounded-full bg-surface-container items-center justify-center mb-2">
                <Ionicons name="image" size={24} color={theme.primary} />
              </View>
              <Text className="text-on-surface font-medium mb-1">Add an image to your story</Text>
              <Text className="text-secondary text-xs">Supports landscape photo banners</Text>
            </TouchableOpacity>
          )}

          <TextInput
            className="w-full text-lg text-on-surface leading-relaxed min-h-[250px]"
            placeholder="Write something meaningful, a daily reflection, or today's breakthrough..."
            placeholderTextColor={theme.secondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
