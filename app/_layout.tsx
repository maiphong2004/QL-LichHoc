// app/_layout.tsx
import { AppProvider } from '@/context/AppContext'; // Import AppProvider của bạn
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    // Bọc toàn bộ ứng dụng bên trong AppProvider để các màn hình con có thể truy cập context
    <AppProvider>
      {/* Đây là nơi định nghĩa navigator cấp cao nhất của bạn */}
      <Stack>
        {/* Ví dụ về cách định nghĩa các màn hình hoặc nhóm route */}
        {/* Nếu bạn có một tab navigator, bạn sẽ trỏ đến layout của tab đó */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Thêm các Stack.Screen khác nếu bạn có màn hình ngoài tab */}
        {/* Ví dụ: <Stack.Screen name="detail/[id]" options={{ presentation: 'modal' }} /> */}
      </Stack>
    </AppProvider>
  );
}