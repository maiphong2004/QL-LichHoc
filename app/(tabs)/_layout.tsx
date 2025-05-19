// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import các component/helper khác nếu bạn đang sử dụng
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        // Đặt headerShown: false ở đây nếu bạn muốn màn hình con tự quản lý header hoàn toàn
        // Hoặc đặt headerShown: true để Expo Router tạo header mặc định và màn hình con tùy chỉnh thêm
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 2 : 0,
        },
        tabBarShowLabel: true,
      }}>

      {/* ĐỊNH NGHĨA CÁC MÀN HÌNH CHÍNH TRONG TAB BAR */}

      {/* Màn hình Trang chủ (index.tsx) */}
      <Tabs.Screen
        name="index" // Tên file: index.tsx trong thư mục app/(tabs)
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
          // Nếu headerShown ở Tabs cha là true, bạn có thể ẩn header cho màn hình cụ thể này nếu muốn
          // headerShown: false,
        }}
      />

      {/* Màn hình Bài tập (HomeworkScreen.tsx) */}
      <Tabs.Screen
        name="HomeworkScreen" // Tên file: HomeworkScreen.tsx trong thư mục app/(tabs)
        options={{
          title: 'Bài tập',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'assignment' : 'assignment-turned-in'} size={24} color={color} />
          ),
          // Nếu headerShown ở Tabs cha là true, bạn có thể ẩn header cho màn hình cụ thể này nếu muốn
          // headerShown: false,
        }}
      />

      {/* Màn hình Lịch học (ScheduleScreen.tsx) */}
      <Tabs.Screen
        name="ScheduleScreen" // Tên file: ScheduleScreen.tsx trong thư mục app/(tabs)
        options={{
          title: 'Lịch học',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
          // Nếu headerShown ở Tabs cha là true, bạn có thể ẩn header cho màn hình cụ thể này nếu muốn
          // headerShown: false,
        }}
      />

      {/* Thêm các màn hình tab khác tại đây nếu có */}

    </Tabs>
  );
}