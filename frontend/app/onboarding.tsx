import React, { useRef, useState } from 'react';
import { useTheme } from '../src/utils/theme';
import { View, Text, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAppDispatch } from '../src/store/hooks';
import { setFirstLaunch } from '../src/store/slices/authSlice';

const { width } = Dimensions.get('window');


export default function OnboardingScreen() {
  const theme = useTheme();
const slides = [
  {
    id: '1',
    title: 'Share Your Story',
    description: 'Write about your day, your experiences, and the moments that matter to you. A quiet space designed for reflective prose.',
    icon: 'pencil-outline',
    badge: 'Quiet Canvas',
    color: theme.primaryContainer,
    bg: theme.surfaceContainer,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: '2',
    title: 'Capture Every Moment',
    description: 'Add an image to your story and turn everyday moments into lasting memories. Keep your visual diary harmonious and uncluttered.',
    icon: 'camera-outline',
    badge: 'Living Memory',
    color: theme.secondary,
    bg: theme.surfaceContainer,
    image: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: '3',
    title: 'Read. Write. Connect.',
    description: 'Discover stories, share your thoughts, and keep your personal journal growing within an appreciative circle of writers.',
    icon: 'book-outline',
    badge: "The Writer's Circle",
    color: theme.primary,
    bg: theme.surfaceContainer,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      dispatch(setFirstLaunch(false));
      router.replace('/(auth)/login' as any);
    }
  };

  const handleSkip = () => {
    dispatch(setFirstLaunch(false));
    router.replace('/(auth)/login' as any);
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={{ width }} className="items-center flex-1">
        
        {/* Top Edge-to-Edge Image */}
        <View className="w-full h-[55%] relative rounded-b-[40px] overflow-hidden shadow-lg">
          <Image source={item.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <View className="absolute inset-0 bg-black/20" />
          
          {/* Floating Tag */}
          <View className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-surface/90 shadow-md flex-row items-center gap-2 border border-outline-variant/30">
            <Ionicons name={item.icon as any} size={16} color={theme.primary} />
            <Text className="font-sans text-xs text-on-surface font-bold uppercase tracking-widest">{item.badge}</Text>
          </View>
        </View>

        {/* Typography Block */}
        <View className="mt-10 px-8 items-center w-full">
          <Text className="font-sans text-3xl font-extrabold text-on-surface text-center mb-4 tracking-tight">
            {item.title}
          </Text>
          <Text className="font-sans text-base text-on-surface-variant text-center leading-relaxed">
            {item.description}
          </Text>
        </View>

      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      
      {/* Floating Skip Button */}
      <SafeAreaView edges={['top']} className="absolute w-full px-6 pt-4 flex-row justify-end items-center z-10 pointer-events-box-none">
        <TouchableOpacity onPress={handleSkip} className="px-5 py-2 rounded-full bg-black/40 shadow-sm border border-white/20">
          <Text className="font-sans text-sm font-medium text-white tracking-wide">Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Carousel */}
      <View className="flex-1">
        <FlatList
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Bottom Area */}
      <SafeAreaView edges={['bottom']} className="px-6 pb-6 pt-2">
        
        {/* Paginator */}
        <View className="flex-row items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const color = scrollX.interpolate({
              inputRange,
              outputRange: [theme.outlineVariant, theme.primaryContainer, theme.outlineVariant], // outline-variant -> primary-container
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i.toString()}
                style={{ width: dotWidth, opacity, backgroundColor: color, height: 8, borderRadius: 9999 }}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <TouchableOpacity 
          className="w-full h-14 bg-primary rounded-full flex-row items-center justify-center gap-2 shadow-sm"
          onPress={scrollToNext}
          activeOpacity={0.8}
        >
          <Text className="font-sans text-on-primary font-bold text-lg tracking-wide">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Ionicons 
            name={currentIndex === slides.length - 1 ? "checkmark" : "arrow-forward"} 
            size={20} 
            color={theme.onPrimary} 
          />
        </TouchableOpacity>

        <View className="items-center mt-4">
          <Text className="font-sans text-sm text-secondary">
            Already have an account?{' '}
            <Text onPress={handleSkip} className="font-bold text-primary underline">Log In</Text>
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}
