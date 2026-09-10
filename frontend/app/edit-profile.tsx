import React, { useState } from 'react';
import { useTheme } from '../src/utils/theme';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { updateProfile } from '../src/store/slices/authSlice';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const [showImageOptions, setShowImageOptions] = useState(false);

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera access is required to take a photo.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    handleImageResult(result);
  };

  const handleChooseLibrary = async () => {
    setShowImageOptions(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    handleImageResult(result);
  };

  const handlePickImage = () => {
    setShowImageOptions(true);
  };

  const goBackSafe = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const handleSave = async () => {
    const words = bio.trim().split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length > 50) {
      setError(`Bio cannot exceed 50 words. Currently: ${words.length}`);
      return;
    }
    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username must be 3-30 characters long and can only contain letters, numbers, and underscores.');
      return;
    }
    setError('');

    const profileData: any = { name, bio };
    if (username !== user?.username) {
      profileData.username = username;
    }
    
    if (imageUri) {
      profileData.imageUri = imageUri;
    }

    try {
      setUploadStatus('uploading');
      await dispatch(updateProfile(profileData)).unwrap();
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        goBackSafe();
      }, 1500);
    } catch (err: any) {
      setUploadStatus('idle');
      setError(err.message || 'Failed to update profile');
    }
  };

  const displayImage = imageUri || user?.profileImage;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-14 px-margin-mobile flex-row items-center justify-between border-b border-surface-container">
        <TouchableOpacity onPress={goBackSafe} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-on-surface tracking-tight">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading || uploadStatus !== 'idle'} className="p-2 -mr-2">
          <Text className={`font-bold text-base ${loading || uploadStatus !== 'idle' ? 'text-secondary' : 'text-primary'}`}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-margin-mobile pt-space-lg">
          
          <View className="items-center mb-space-xl">
            <TouchableOpacity onPress={handlePickImage} className="relative active:scale-95 transition-transform">
              <View className="w-24 h-24 rounded-full bg-surface-container-high items-center justify-center overflow-hidden border-2 border-surface-container shadow-sm">
                {displayImage ? (
                  <Image source={{ uri: displayImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                ) : (
                  <Text className="text-4xl text-primary font-bold">{user?.name?.charAt(0) || 'U'}</Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-surface shadow-sm">
                <Ionicons name="camera" size={16} color={theme.white} />
              </View>
            </TouchableOpacity>
            <View className="mt-3 flex-row items-center gap-1.5 opacity-80">
              <Ionicons name="time-outline" size={14} color={theme.outline} />
              <Text className="text-xs text-secondary font-medium">Image updates limited to once per 24h</Text>
            </View>
          </View>

          {error ? (
            <View className="bg-error-container p-3 rounded-lg mb-space-md">
              <Text className="text-on-error-container text-sm">{error}</Text>
            </View>
          ) : null}

          <View className="mb-space-lg">
            <Text className="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">Name</Text>
            <TextInput
              className="bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-4 text-base text-on-surface"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.secondary}
            />
          </View>

          <View className="mb-space-lg">
            <Text className="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">Username</Text>
            <View className="flex-row items-center bg-surface-container-highest border border-outline-variant rounded-xl px-4">
              <Text className="text-secondary text-base">@</Text>
              <TextInput
                className="flex-1 py-4 px-2 text-base text-on-surface"
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={theme.secondary}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-space-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-secondary uppercase tracking-wider">Bio</Text>
              <Text className={`text-xs ${bio.trim().split(/\s+/).filter((w: string) => w.length > 0).length > 50 ? 'text-error' : 'text-secondary'}`}>
                {bio.trim().split(/\s+/).filter((w: string) => w.length > 0).length}/50 words
              </Text>
            </View>
            <TextInput
              className="bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-4 text-base text-on-surface"
              value={bio}
              onChangeText={setBio}
              placeholder="A brief reflection about yourself..."
              placeholderTextColor={theme.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />
          </View>

          <View className="mb-space-lg">
            <Text className="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">Email (Read Only)</Text>
            <View className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 opacity-70">
              <Text className="text-base text-secondary">{user?.email}</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={uploadStatus !== 'idle'} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface w-full p-8 rounded-3xl items-center shadow-lg">
            {uploadStatus === 'uploading' ? (
              <>
                <Ionicons name="cloud-upload-outline" size={64} color={theme.primary} className="mb-4" />
                <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">Updating...</Text>
                <Text className="text-sm text-secondary text-center leading-relaxed">Please wait while we securely save your profile changes to the cloud.</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={64} color={theme.primary} className="mb-4" />
                <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">Update done</Text>
                <Text className="text-sm text-secondary text-center leading-relaxed">Your profile has been updated!</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showImageOptions} transparent animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
        <TouchableOpacity 
          className="flex-1 justify-end bg-black/40"
          activeOpacity={1} 
          onPress={() => setShowImageOptions(false)}
        >
          <View className="bg-surface rounded-t-3xl pt-2 pb-8 px-6 shadow-lg border-t border-surface-container">
            <View className="w-12 h-1.5 bg-outline-variant/50 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-on-surface mb-6 text-center">Profile Photo</Text>
            
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
