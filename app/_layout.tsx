// app/_layout.tsx (ở cấp gốc của thư mục app)
import { AppProvider } from '@/context/AppContext'; // Import AppProvider của bạn
import { Stack } from 'expo-router'; // Hoặc Tabs, tùy thuộc vào navigator cấp cao nhất

export default function RootLayout() {
  return (
    // Bọc toàn bộ ứng dụng bên trong AppProvider
    <AppProvider>
      {/* Đây là nơi định nghĩa navigator cấp cao nhất, ví dụ Stack Navigator */}
      {/* Các màn hình hoặc nhóm route sẽ được render bên trong Stack.Screen hoặc Slot */}
      <Stack>
        {/* Ví dụ: Các Stack.Screen hoặc một Slot để render nested routes */}
        {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
        {/* Các màn hình khác nếu có */}
      </Stack>
      {/* Hoặc nếu bạn dùng Slot để render các route con */}
      {/* <Slot /> */}
    </AppProvider>
  );
}
