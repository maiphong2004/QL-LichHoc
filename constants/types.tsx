// navigation/types.ts

// Định nghĩa kiểu cho các params của từng route trong Bottom Tab Navigator của bạn
// 'index', 'schedule', 'HomeworkScreen' là tên screen/route bạn dùng trong Tab.Screen name
// undefined nghĩa là route này không nhận params
export type RootTabParamList = {
     index: undefined; // Thêm route cho màn hình Trang chủ (index.tsx)
     schedule: undefined;
     HomeworkScreen: undefined; // Đảm bảo tên khớp với Tabs.Screen name
     // Thêm các route khác nếu có (ví dụ: settings)
     // settings: undefined;
};

// Các kiểu tiện ích để dùng với useNavigation
declare global {
     namespace ReactNavigation {
          // Liên kết RootTabParamList với React Navigation cho Bottom Tabs
          interface RootParamList extends RootTabParamList { }
     }
}