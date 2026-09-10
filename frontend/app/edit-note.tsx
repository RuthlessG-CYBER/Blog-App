import React, { useState, useEffect } from 'react';
import { useTheme } from '../src/utils/theme';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { updatePost, uploadPostImage } from '../src/store/slices/postSlice';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

export default function EditNoteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { posts } = useAppSelector((state) => state.posts);
  const post: any = posts.find((p: any) => p.id === id);
  
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [image, setImage] = useState<string | null>(post?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  const [showImageOptions, setShowImageOptions] = useState(false);

  useEffect(() => {
    if (!post) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Post not found', position: 'bottom' });
      router.back();
    }
  }, [post]);

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera access is required.' });
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    handleImageResult(result);
  };

  const handleChooseLibrary = async () => {
    setShowImageOptions(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    handleImageResult(result);
  };

  const pickImage = () => {
    setShowImageOptions(true);
  };

  const handlePost = async () => {
    if (!title || !content) {
      Toast.show({ type: 'error', text1: 'Draft Incomplete', text2: 'Title and Content are required to update.', position: 'bottom' });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(updatePost({ postId: id as string, postData: { title, content } }));
      if (updatePost.fulfilled.match(resultAction)) {
        if (image && !image.startsWith('http')) {
          await dispatch(uploadPostImage({ postId: id as string, imageUri: image }));
        }
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: resultAction.payload as string || 'Failed to update chronicle', position: 'bottom' });
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
            <Text className="text-lg font-bold text-on-surface leading-tight">Edit Story</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-xs text-secondary">Disclaimer: 3-hour edit limit</Text>
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
                <Ionicons name="save" size={16} color={theme.onPrimary} />
                <Text className="text-on-primary font-bold text-sm">Save</Text>
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

      <Modal visible={showImageOptions} transparent animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
        <TouchableOpacity 
          className="flex-1 justify-end bg-black/40"
          activeOpacity={1} 
          onPress={() => setShowImageOptions(false)}
        >
          <View className="bg-surface rounded-t-3xl pt-2 pb-8 px-6 shadow-lg border-t border-surface-container">
            <View className="w-12 h-1.5 bg-outline-variant/50 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-on-surface mb-6 text-center">Add Photo</Text>
            
            <TouchableOpacity 
              className="flex-row items-center p-4 bg-surface-container rounded-2xl mb-4 shadow-sm"
              onPress={handleTakePhoto}
            >
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color={theme.primary} />
              </View>
              <View>
                <Text className="text-base font-bold text-on-surface mb-0.5">Take a Photo</Text>
                <Text className="text-xs text-secondary">Use your camera to capture now</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 bg-surface-container rounded-2xl shadow-sm"
              onPress={handleChooseLibrary}
            >
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Ionicons name="images" size={24} color={theme.primary} />
              </View>
              <View>
                <Text className="text-base font-bold text-on-surface mb-0.5">Choose from Library</Text>
                <Text className="text-xs text-secondary">Upload an existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
