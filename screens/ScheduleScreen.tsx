import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment'; // Import moment
import 'moment/locale/vi';
import React, { useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
moment.locale('vi');

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Import Modal và Context
import AddScheduleModal from '@/app/(tabs)/AddScheduleModal'; // Đảm bảo đường dẫn đúng
import { ScheduleEvent, useAppContext } from '@/context/AppContext'; // Đảm bảo đường dẫn đúng

// Hàm helper định dạng thời gian cho item lịch học (có thể copy từ HomeworkScreen hoặc định nghĩa riêng)
const formatTimeRange = (startTime: string, endTime: string): string => {
     return `${moment(startTime, 'HH:mm').format('HH:mm')} - ${moment(endTime, 'HH:mm').format('HH:mm')}`;
};

// Hàm helper lấy tên ngày trong tuần bằng tiếng Việt
const getVietnameseDayName = (dayKey: string): string => {
     const daysMapVi: { [key: string]: string } = {
          'Mon': 'Thứ Hai', 'Tue': 'Thứ Ba', 'Wed': 'Thứ Tư', 'Thu': 'Thứ Năm', 'Fri': 'Thứ Sáu', 'Sat': 'Thứ Bảy', 'Sun': 'Chủ Nhật'
     };
     return daysMapVi[dayKey] || dayKey; // Trả về tên tiếng Việt hoặc dayKey gốc nếu không tìm thấy
};


// Đây là component màn hình Lịch học được render bởi Navigator
// Chú ý: Nó KHÔNG nhận các props của Modal như visible, onClose, v.v.
export default function ScheduleScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu lịch và các hàm thêm/sửa/xóa từ Context
     const { schedule, addSchedule, updateSchedule, deleteSchedule } = useAppContext();

     // State để quản lý Modal
     const [isModalVisible, setModalVisible] = useState(false);
     const [selectedItemToEdit, setSelectedItemToEdit] = useState<ScheduleEvent | null>(null); // Lưu item đang chỉnh sửa

     // Cấu hình nút Add ở Header
     useLayoutEffect(() => {
          navigation.setOptions({
               headerRight: () => (
                    <TouchableOpacity
                         style={{ marginRight: 15 }}
                         onPress={() => {
                              setSelectedItemToEdit(null); // Khi nhấn nút Add, đảm bảo là thêm mới
                              setModalVisible(true); // Mở Modal
                         }}
                    >
                         <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                    </TouchableOpacity>
               ),
               // Tiêu đề Header cho màn hình này (có thể đặt ở _layout.tsx hoặc ở đây)
               title: 'Lịch học',
          });
     }, [navigation]); // Dependency array


     // Hàm render cho mỗi item Lịch học trong FlatList
     const renderScheduleItem = ({ item }: { item: ScheduleEvent }) => {
          const daysVietnamese = item.daysOfWeek.map(dayKey => getVietnameseDayName(dayKey)).join(', '); // Lấy tên ngày tiếng Việt

          return (
               <TouchableOpacity
                    style={styles.scheduleItem}
                    onPress={() => {
                         setSelectedItemToEdit(item); // Khi nhấn vào item, lưu item đó vào state để sửa
                         setModalVisible(true); // Mở Modal
                    }}
               >
                    <ThemedText type="defaultSemiBold" style={styles.itemTitle}>{item.subject}</ThemedText>
                    <ThemedText style={styles.itemTime}>{formatTimeRange(item.startTime, item.endTime)}</ThemedText>
                    <ThemedText style={styles.itemDays}>{daysVietnamese}</ThemedText>
                    <ThemedText style={styles.itemLocation}>Tại: {item.location}</ThemedText>
               </TouchableOpacity>
          );
     };

     // TODO: Thêm bộ lọc/sắp xếp cho Lịch học nếu cần

     return (
          <ThemedView style={styles.container}>
               {/* TODO: Hiển thị bộ lọc/sắp xếp Controls tại đây nếu có */}

               {/* Hiển thị danh sách Lịch học */}
               {schedule.length > 0 ? (
                    <FlatList
                         data={schedule} // Sử dụng dữ liệu lịch từ context
                         keyExtractor={(item) => item.id}
                         renderItem={renderScheduleItem}
                         contentContainerStyle={styles.flatListContent}
                    />
               ) : (
                    <View style={styles.emptyStateContainer}>
                         <ThemedText style={styles.emptyStateText}>Chưa có lịch học nào được thêm.</ThemedText>
                         <ThemedText style={styles.emptyStateText}>Nhấn nút "+" ở góc trên để thêm mới!</ThemedText>
                    </View>
               )}


               {/* Render Modal và truyền các props cần thiết */}
               <AddScheduleModal
                    visible={isModalVisible} // Modal hiển thị nếu state isModalVisible là true
                    itemToEdit={selectedItemToEdit} // Truyền item đang chỉnh sửa vào modal
                    onClose={() => { // Hàm đóng modal
                         setModalVisible(false);
                         setSelectedItemToEdit(null); // Reset item đang chỉnh sửa
                    }}
                    onSave={(scheduleData) => { // Hàm xử lý lưu từ modal
                         if (selectedItemToEdit && 'id' in scheduleData) {
                              // Nếu đang sửa (itemToEdit tồn tại và scheduleData có id), gọi update
                              updateSchedule(scheduleData as ScheduleEvent);
                         } else {
                              // Nếu không (thêm mới), gọi add
                              addSchedule(scheduleData as Omit<ScheduleEvent, 'id'>);
                         }
                         setModalVisible(false); // Đóng modal sau khi lưu
                         setSelectedItemToEdit(null);
                    }}
                    onDelete={(id) => { // Hàm xử lý xóa từ modal
                         deleteSchedule(id);
                         // Không cần setModalVisible(false) ở đây vì hàm deleteSchedule trong context có thể trigger re-render hoặc bạn tự đóng modal sau khi gọi hàm này.
                         // Tuy nhiên, gọi setModalVisible(false) ở đây là cách đơn giản để đóng modal sau khi nhấn nút xóa trong modal.
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
               />
          </ThemedView>
     );
}

// Định nghĩa styles cho màn hình Lịch học
const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: '#f4f7f6', // Màu nền màn hình
          paddingHorizontal: 10, // Padding ngang cho toàn màn hình
          paddingTop: 10, // Padding trên
     },
     flatListContent: {
          paddingBottom: 20, // Khoảng trống dưới cùng danh sách
     },
     scheduleItem: { // Style cho mỗi item lịch học trong danh sách
          backgroundColor: '#fff',
          padding: 15,
          marginBottom: 10,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderLeftWidth: 5, // Viền màu bên trái
          borderColor: '#3498db', // Màu xanh dương cho lịch học
     },
     itemTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 5,
          color: '#333',
     },
     itemTime: {
          fontSize: 15,
          color: '#555',
          marginBottom: 3,
     },
     itemDays: {
          fontSize: 15,
          color: '#555',
          marginBottom: 3,
     },
     itemLocation: {
          fontSize: 15,
          color: '#555',
     },
     emptyStateContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
     },
     emptyStateText: {
          textAlign: 'center',
          fontSize: 16,
          color: '#555',
          marginBottom: 10,
     },
});