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
import { ScheduleEvent, useAppContext } from '@/context/AppContext'; // Import từ context
import AddScheduleModal from '../../components/AddScheduleModal';

// Hàm helper định dạng thời gian cho item lịch học
const formatTimeRange = (startTime: string, endTime: string): string => {
     return `${moment(startTime, 'HH:mm').format('HH:mm')} - ${moment(endTime, 'HH:mm').format('HH:mm')}`;
};

// Hàm helper lấy tên ngày trong tuần bằng tiếng Việt
const getVietnameseDayName = (dayKey: string): string => {
     const daysMapVi: { [key: string]: string } = {
          Mon: 'Thứ Hai',
          Tue: 'Thứ Ba',
          Wed: 'Thứ Tư',
          Thu: 'Thứ Năm',
          Fri: 'Thứ Sáu',
          Sat: 'Thứ Bảy',
          Sun: 'Chủ Nhật',
     };
     return daysMapVi[dayKey] || dayKey;
};

export default function ScheduleScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu và hàm từ AppContext
     const { schedules, addSchedule, updateSchedule, deleteSchedule } = useAppContext();

     const [modalVisible, setModalVisible] = useState(false);
     const [itemToEdit, setItemToEdit] = useState<ScheduleEvent | null>(null);

     // Sắp xếp lịch học theo ngày trong tuần và thời gian
     const sortedSchedules = React.useMemo(() => {
          const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return [...schedules].sort((a, b) => {
               const dayA = dayOrder.indexOf(a.daysOfWeek[0]); // Lấy ngày đầu tiên để sắp xếp
               const dayB = dayOrder.indexOf(b.daysOfWeek[0]);

               if (dayA !== dayB) {
                    return dayA - dayB;
               }

               // Nếu cùng ngày, sắp xếp theo thời gian bắt đầu
               const timeA = moment(a.startTime, 'HH:mm');
               const timeB = moment(b.startTime, 'HH:mm');
               return timeA.diff(timeB);
          });
     }, [schedules]);


     // Cấu hình header bên phải để thêm nút "Thêm lịch học"
     useLayoutEffect(() => {
          navigation.setOptions({
               headerRight: () => (
                    <TouchableOpacity
                         onPress={() => {
                              setItemToEdit(null); // Đảm bảo là thêm mới
                              setModalVisible(true);
                         }}
                         style={{ marginRight: 15 }}
                    >
                         <Ionicons name="add-circle" size={30} color="#3498db" />
                    </TouchableOpacity>
               ),
               // Cấu hình headerLeft nếu cần hoặc để trống
               headerLeft: () => null,
               headerTitle: 'Lịch học', // Đặt tiêu đề cho màn hình
          });
     }, [navigation]);

     const handleSaveSchedule = async (event: Omit<ScheduleEvent, 'id'> | ScheduleEvent) => {
          if ('id' in event) {
               await updateSchedule(event as ScheduleEvent); // Gọi hàm update từ context
          } else {
               await addSchedule(event); // Gọi hàm add từ context
          }
          setModalVisible(false);
          setItemToEdit(null);
     };

     const handleDeleteSchedule = async (id: string) => {
          await deleteSchedule(id); // Gọi hàm delete từ context
     };

     const renderScheduleItem = ({ item }: { item: ScheduleEvent }) => (
          <TouchableOpacity
               style={styles.scheduleItem}
               onPress={() => {
                    setItemToEdit(item);
                    setModalVisible(true);
               }}
          >
               <View style={styles.scheduleContent}>
                    <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.itemSubject}>Môn: {item.subject}</ThemedText>
                    <ThemedText style={styles.itemTime}>
                         Thời gian: {formatTimeRange(item.startTime, item.endTime)}
                    </ThemedText>
                    <ThemedText style={styles.itemDays}>
                         Ngày: {item.daysOfWeek.map(getVietnameseDayName).join(', ')}
                    </ThemedText>
                    {item.location && (
                         <ThemedText style={styles.itemLocation}>Địa điểm: {item.location}</ThemedText>
                    )}
                    {item.notes && (
                         <ThemedText style={styles.itemNotes}>Ghi chú: {item.notes}</ThemedText>
                    )}
               </View>
               <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
     );

     return (
          <ThemedView style={styles.container}>
               <FlatList
                    data={sortedSchedules}
                    renderItem={renderScheduleItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={
                         <ThemedText style={styles.emptyListText}>
                              Không có lịch học nào. Hãy thêm một lịch học mới!
                         </ThemedText>
                    }
               />

               <AddScheduleModal
                    visible={modalVisible}
                    itemToEdit={itemToEdit}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveSchedule}
                    onDelete={handleDeleteSchedule}
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
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     scheduleContent: {
          flex: 1,
          marginRight: 10,
     },
     itemTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 5,
          color: '#333',
     },
     itemSubject: {
          fontSize: 15,
          color: '#555',
          marginBottom: 3,
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
          fontSize: 14,
          color: '#666',
          fontStyle: 'italic',
          marginBottom: 3,
     },
     itemNotes: {
          fontSize: 13,
          color: '#666',
          marginTop: 5,
          fontStyle: 'italic',
     },
     emptyListText: {
          textAlign: 'center',
          marginTop: 50,
          fontSize: 16,
          color: '#888',
     },
});