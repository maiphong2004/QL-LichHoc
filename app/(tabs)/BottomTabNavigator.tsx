import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Cài đặt icon: npx expo install @expo/vector-icons
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeworkScreen from '@/app/(tabs)/HomeworkScreen';
import ScheduleScreen from '@/app/(tabs)/ScheduleScreen';

// Giả định bạn có hook useClientOnlyValue để chọn giá trị theo nền tảng
// import { useClientOnlyValue } from '@/components/useClientOnlyValue';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
     // Bạn có thể tùy chỉnh màu sắc, style ở đây
     const tintColor = '#2f95dc'; // Màu icon khi active

     return (
          <Tab.Navigator
               screenOptions={{
                    tabBarActiveTintColor: tintColor,
                    // headerShown: useClientOnlyValue(false, true), // Ẩn header trên web nếu cần
               }}>
               <Tab.Screen
                    name="schedule" // Tên route nội bộ
                    component={ScheduleScreen}
                    options={{
                         title: 'Lịch học', // Tên hiển thị trên tab
                         tabBarIcon: ({ color, focused }) => (
                              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
                         ),
                         // Có thể thêm headerRight nếu muốn nút "+ Thêm" ở góc trên
                         // headerRight: () => (
                         //      <Link href="/add-schedule" style={{ marginRight: 15 }}> {/* Cần cấu hình route '/add-schedule' */}
                         //           <Ionicons name="add-circle-outline" size={24} color={tintColor} />
                         //      </Link>
                         // ),
                    }}
               />
               <Tab.Screen
                    name="homework" // Tên route nội bộ
                    component={HomeworkScreen}
                    options={{
                         title: 'Bài tập', // Tên hiển thị trên tab
                         tabBarIcon: ({ color, focused }) => (
                              <MaterialIcons name={focused ? 'assignment' : 'assignment-turned-in'} size={24} color={color} />
                         ),
                         // headerRight: () => (
                         //      <Link href="/add-homework" style={{ marginRight: 15 }}> {/* Cần cấu hình route '/add-homework' */}
                         //           <Ionicons name="add-circle-outline" size={24} color={tintColor} />
                         //      </Link>
                         // ),
                    }}
               />
               {/* Có thể thêm màn hình Cài đặt hoặc khác tại đây */}
               {/*
      <Tab.Screen
         name="settings"
         component={SettingsScreen}
         options={{
           title: 'Cài đặt',
           tabBarIcon: ({ color, focused }) => (
             <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
           ),
         }}
       />
      */}
          </Tab.Navigator>
     );
}