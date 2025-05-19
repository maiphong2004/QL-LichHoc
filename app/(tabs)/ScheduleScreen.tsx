import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/vi';
import React, { useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
moment.locale('vi');

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Import Modal và Context - Đảm bảo đường dẫn đúng
import { ScheduleEvent, useAppContext } from '@/context/AppContext'; // Đường dẫn tuyệt đối đến context
import AddScheduleModal from '../../components/AddScheduleModal'; // Đường dẫn tương đối trong cùng thư mục (tabs)

// Hàm helper định dạng thời gian cho item lịch học
const formatTimeRange = (startTime: string, endTime: string): string => {
     return `${moment(startTime, 'HH:mm').format('HH:mm')} - ${moment(endTime, 'HH:mm').format('HH:mm')}`;
};

// Hàm helper lấy tên ngày trong tuần bằng tiếng Việt
const getVietnameseDayName = (dayKey: string): string => {
     const daysMapVi: { [key: string]: string } = {
          'Mon': 'Thứ Hai', 'Tue': 'Thứ Ba', 'Wed': 'Thứ Tư', 'Thu': 'Thứ Năm', 'Fri': 'Thứ Sáu', 'Sat': 'Thứ Bảy', 'Sun': 'Chủ Nhật'
     };
     return daysMapVi[dayKey] || dayKey;
};


// Đây là component màn hình Lịch học được render bởi Navigator
export default function ScheduleScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu lịch và các hàm thêm/sửa/xóa từ Context
     const { schedule, addSchedule, updateSchedule, deleteSchedule } = useAppContext();

     // State để quản lý Modal
     const [isModalVisible, setModalVisible] = useState(false);
     const [selectedItemToEdit, setSelectedItemToEdit] = useState<ScheduleEvent | null>(null);

     // Cấu hình nút Add ở Header
     useLayoutEffect(() => {
          navigation.setOptions({
               headerRight: () => (
                    <TouchableOpacity
                         style={{ marginRight: 15 }}
                         onPress={() => {
                              setSelectedItemToEdit(null);
                              setModalVisible(true);
                         }}
                    >
                         <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                    </TouchableOpacity>
               ),
               title: 'Lịch học', // Tiêu đề Header cho màn hình này
          });
     }, [navigation]);


     // Hàm render cho mỗi item Lịch học trong FlatList
     const renderScheduleItem = ({ item }: { item: ScheduleEvent }) => {
          const daysVietnamese = item.daysOfWeek.map(dayKey => getVietnameseDayName(dayKey)).join(', ');

          return (
               <TouchableOpacity
                    style={styles.scheduleItem}
                    onPress={() => {
                         setSelectedItemToEdit(item);
                         setModalVisible(true);
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
                         data={schedule}
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
                    visible={isModalVisible}
                    itemToEdit={selectedItemToEdit}
                    onClose={() => {
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
                    onSave={(scheduleData) => {
                         if (selectedItemToEdit && 'id' in scheduleData) {
                              updateSchedule(scheduleData as ScheduleEvent);
                         } else {
                              addSchedule(scheduleData as Omit<ScheduleEvent, 'id'>);
                         }
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
                    onDelete={(id) => {
                         deleteSchedule(id);
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
          backgroundColor: '#f4f7f6',
          paddingHorizontal: 10,
          paddingTop: 10,
     },
     flatListContent: {
          paddingBottom: 20,
     },
     scheduleItem: {
          backgroundColor: '#fff',
          padding: 15,
          marginBottom: 10,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderLeftWidth: 5,
          borderColor: '#3498db',
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