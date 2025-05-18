// navigation/types.ts

// Định nghĩa kiểu cho các params của từng route trong Bottom Tab Navigator của bạn
// 'schedule' và 'homework' là tên screen/route bạn dùng trong Tab.Screen name
// undefined nghĩa là route này không nhận params, hoặc params là tùy chọn và có thể là undefined
export type RootTabParamList = {
     schedule: undefined; // Route 'schedule' không nhận tham số
     homework: undefined; // Route 'homework' không nhận tham số
     // home: undefined; // Nếu bạn có màn hình home/index.tsx là một tab
     // settings: undefined; // Nếu bạn có màn hình settings là một tab
     // Thêm các route khác nếu có
};

// Định nghĩa kiểu cho Root Stack Navigator (nếu có stack bên ngoài tabs)
// export type RootStackParamList = {
//   (tabs): undefined; // Nếu bottom tabs là route chính
//   AddScreen: { type: 'schedule' | 'homework' }; // Ví dụ: nếu bạn có màn hình Add chung
//   // Các route khác ngoài bottom tabs
// };

// Các kiểu tiện ích để dùng với useNavigation
// declare global {
//   namespace ReactNavigation {
//     // Liên kết RootStackParamList với React Navigation (nếu có Stack)
//     // interface RootParamList extends RootStackParamList {}

//      // Nếu Bottom Tabs là Root Navigator, liên kết RootTabParamList
//      interface RootParamList extends RootTabParamList {}
//   }
// }