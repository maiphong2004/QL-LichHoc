// Ví dụ về file App.js/App.tsx GÂY LỖI
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from '@/app/(tabs)/_layout'; // Import navigator từ _layout.tsx

export default function App() {
     return (
          // LỖI: Bọc TabLayout trong NavigationContainer MỘT LẦN NỮA
          <NavigationContainer>
               <TabLayout />
          </NavigationContainer>
     );
}