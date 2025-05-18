// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Đảm bảo đã import icons

// Import các component/helper khác nếu bạn đang sử dụng
// Chỉ giữ lại các import bạn thực sự dùng trong _layout.tsx (HapticTab, TabBarBackground, Colors, useColorScheme)
import { HapticTab } from '@/components/HapticTab'; // Ví dụ
// import { IconSymbol } from '@/components/ui/IconSymbol'; // Ví dụ (comment out nếu không dùng)
import TabBarBackground from '@/components/ui/TabBarBackground'; // Ví dụ
import { Colors } from '@/constants/Colors'; // Ví dụ
import { useColorScheme } from '@/hooks/useColorScheme'; // Ví dụ

export default function TabLayout() {
  const colorScheme = useColorScheme(); // Nếu bạn dùng chế độ sáng/tối

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, // Màu icon/text khi active (dùng từ Colors nếu có)
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault, // Màu icon/text khi inactive (dùng từ Colors nếu có)
        headerShown: true, // Đặt false để màn hình con tự quản lý header của nó (ví dụ: HomeworkScreen dùng useLayoutEffect). HOẶC đặt true nếu bạn muốn header mặc định. Tùy vào cách bạn muốn quản lý Header.
        tabBarButton: HapticTab, // Giữ lại nếu bạn dùng custom tab button
        tabBarBackground: TabBarBackground, // Giữ lại nếu bạn dùng custom tab background
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // Quan trọng cho hiệu ứng blur trên iOS
          },
          default: {
            // Các style mặc định cho Android nếu cần
            backgroundColor: Colors[colorScheme ?? 'light'].background, // Màu nền tab bar
          },
        }),
        // --- STYLE QUAN TRỌNG ĐỂ HIỂN THỊ TÊN (LABEL) VÀ ICON ---
        tabBarLabelStyle: { // Style cho text của tab (tên)
          fontSize: 12, // Kích thước font chữ cho label
          marginBottom: Platform.OS === 'android' ? 2 : 0, // Khoảng cách dưới cho Android để căn chỉnh
        },
        tabBarIconStyle: { // Style cho icon của tab
          marginTop: Platform.OS === 'android' ? 2 : 0, // Khoảng cách trên cho Android để căn chỉnh
        },
        tabBarShowLabel: true, // <-- Đảm bảo thuộc tính này là true (mặc định đã là true nếu có đủ không gian)
        // --- KẾT THÚC STYLE QUAN TRỌNG ---
      }}>

      {/* ĐỊNH NGHĨA CÁC MÀN HÌNH CHÍNH TRONG TAB BAR */}

      {/* Màn hình Trang chủ (index.tsx) */}
      <Tabs.Screen
        name="index" // Tên file: index.tsx trong thư mục app/(tabs)
        options={{
          title: 'Trang chủ', // <--- Tên hiển thị trên tab
          tabBarIcon: ({ color, focused }) => ( // Thêm lại icon cho tab này
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* Màn hình Bài tập (HomeworkScreen.tsx) */}
      <Tabs.Screen
        name="HomeworkScreen" // Tên file: HomeworkScreen.tsx trong thư mục app/(tabs)
        options={{
          title: 'Bài tập', // <--- Tên hiển thị trên tab
          tabBarIcon: ({ color, focused }) => ( // Thêm lại icon cho tab này
            <MaterialIcons name={focused ? 'assignment' : 'assignment-turned-in'} size={24} color={color} />
          ),
        }}
      />

      {/* Màn hình Lịch học (ScheduleScreen.tsx) */}
      <Tabs.Screen
        name="ScheduleScreen" // Tên file: ScheduleScreen.tsx trong thư mục app/(tabs)
        options={{
          title: 'Lịch học', // <--- Tên hiển thị trên tab
          tabBarIcon: ({ color, focused }) => ( // Thêm lại icon cho tab này
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* XÓA CÁC ĐỊNH NGHĨA Tabs.Screen KHÔNG CHÍNH XÁC CHO MODAL VÀ NAVIGATOR */}
      {/*
      <Tabs.Screen
        name="AddHomeworkModal" // Xóa dòng này
        options={{ title: 'Thêm bài tập' }} // Xóa dòng này
      />
      <Tabs.Screen
        name="AddScheduleModal" // Xóa dòng này
        options={{ title: 'Thêm lịch học' }} // Xóa dòng này
      />
      <Tabs.Screen name='BottomTabNavigator' options={{ title: "Quản lý" }} /> // Xóa dòng này
      */}

      {/* Các màn hình khác nếu có (ví dụ: Cài đặt) sẽ được thêm Tabs.Screen tương ứng */}
      {/* Ví dụ:
      <Tabs.Screen
        name="settings" // Tên file: settings.tsx trong app/(tabs)
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, focused }) => (
             <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
      */}

    </Tabs>
  );
}