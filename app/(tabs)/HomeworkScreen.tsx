import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker'; // Không cần Picker ở đây
import { useNavigation } from '@react-navigation/native'; // Vẫn giữ nếu bạn dùng useNavigation cho các mục đích khác
import moment from 'moment';
import 'moment/locale/vi';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
moment.locale('vi');

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Import Modal và Context - Đảm bảo đường dẫn đúng
import AddHomeworkModal from '@/components/AddHomeworkModal';
import { HomeworkItem, useAppContext } from '@/context/AppContext'; // Import từ context

// Hàm helper định dạng ngày hạn chót
const formatDueDate = (dateString: string) => {
     const date = moment(dateString);
     const now = moment();

     // Kiểm tra nếu đã quá hạn (dueDate trước thời gian hiện tại) VÀ trạng thái chưa hoàn thành
     if (date.isBefore(now, 'minute')) {
          // Chỉ hiển thị 'QUÁ HẠN' nếu nó thực sự đã qua và không phải hôm nay
          if (!date.isSame(now, 'day')) {
               return 'QUÁ HẠN: ' + date.format('HH:mm, DD/MM/YYYY');
          }
     }
     if (date.isSame(now, 'day')) {
          return 'Hôm nay, ' + date.format('HH:mm');
     } else if (date.isSame(now.add(1, 'day'), 'day')) {
          return 'Ngày mai, ' + date.format('HH:mm');
     } else if (date.isBetween(now, now.add(7, 'days'), 'day', '[]')) {
          return date.format('dddd, HH:mm'); // Hiển thị "Thứ Hai, HH:mm"
     }
     return date.format('HH:mm, DD/MM/YYYY');
};


// Hàm helper lấy màu cho borderLeftWidth dựa trên trạng thái và quá hạn
const getItemColor = (item: HomeworkItem) => {
     const isOverdue = moment(item.dueDate).isBefore(moment()) && item.status !== 'completed';
     if (item.status === 'completed') {
          return '#28a745'; // Green for completed
     } else if (isOverdue) {
          return '#dc3545'; // Red for overdue
     }
     return '#007bff'; // Blue for pending and not overdue
};

export default function HomeworkScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu và hàm từ AppContext
     const { homeworks, addHomework, updateHomework, deleteHomework } = useAppContext();

     const [modalVisible, setModalVisible] = useState(false);
     const [itemToEdit, setItemToEdit] = useState<HomeworkItem | null>(null);
     const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
     const [sortBy, setSortBy] = useState<'dueDate' | 'subject'>('dueDate');

     // Cấu hình header bên phải để thêm nút "Thêm bài tập"
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
               headerTitle: 'Danh sách bài tập', // Đặt tiêu đề cho màn hình
          });
     }, [navigation]);

     // Lọc và sắp xếp bài tập
     const filteredAndSortedHomeworks = useMemo(() => {
          let filtered = homeworks;

          if (filterStatus !== 'all') {
               filtered = homeworks.filter((hw) => hw.status === filterStatus);
          }

          // Sắp xếp: Ưu tiên bài tập quá hạn chưa hoàn thành lên đầu
          // Sau đó sắp xếp theo ngày hết hạn hoặc môn học
          return filtered.sort((a, b) => {
               const aIsOverdue = moment(a.dueDate).isBefore(moment()) && a.status !== 'completed';
               const bIsOverdue = moment(b.dueDate).isBefore(moment()) && b.status !== 'completed';

               if (aIsOverdue && !bIsOverdue) return -1;
               if (!aIsOverdue && bIsOverdue) return 1;

               if (sortBy === 'dueDate') {
                    return moment(a.dueDate).diff(moment(b.dueDate));
               } else {
                    return a.subject.localeCompare(b.subject);
               }
          });
     }, [homeworks, filterStatus, sortBy]);

     const handleSaveHomework = async (homework: Omit<HomeworkItem, 'id'> | HomeworkItem) => {
          if ('id' in homework) {
               await updateHomework(homework as HomeworkItem); // Gọi hàm update từ context
          } else {
               await addHomework(homework); // Gọi hàm add từ context
          }
          setModalVisible(false);
          setItemToEdit(null);
     };

     const handleDeleteHomework = async (id: string) => {
          await deleteHomework(id); // Gọi hàm delete từ context
     };

     const renderHomeworkItem = ({ item }: { item: HomeworkItem }) => {
          const isOverdue = moment(item.dueDate).isBefore(moment(), 'minute') && item.status !== 'completed';
          const itemStyle = [
               styles.homeworkItem,
               { borderLeftColor: getItemColor(item) },
               isOverdue && styles.overdueItem,
          ];

          return (
               <TouchableOpacity
                    style={itemStyle}
                    onPress={() => {
                         setItemToEdit(item);
                         setModalVisible(true);
                    }}
               >
                    <View style={styles.homeworkContent}>
                         <ThemedText style={styles.itemTitle}>{item.description}</ThemedText>
                         <ThemedText style={styles.itemSubject}>Môn: {item.subject}</ThemedText>
                         <ThemedText style={[styles.itemDueDate, isOverdue && styles.overdueText]}>
                              Hạn: {formatDueDate(item.dueDate)}
                         </ThemedText>
                         {item.notes && (
                              <ThemedText style={styles.itemNotes}>Ghi chú: {item.notes}</ThemedText>
                         )}
                    </View>
                    <Ionicons
                         name={item.status === 'completed' ? 'checkmark-circle' : 'hourglass'}
                         size={28}
                         color={getItemColor(item)}
                    />
               </TouchableOpacity>
          );
     };

     return (
          <ThemedView style={styles.container}>
               <View style={styles.filterSortContainer}>
                    {/* Filter */}
                    <View style={styles.filterGroup}>
                         <ThemedText style={styles.filterLabel}>Trạng thái:</ThemedText>
                         <TouchableOpacity
                              style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
                              onPress={() => setFilterStatus('all')}
                         >
                              <ThemedText style={styles.filterButtonText}>Tất cả</ThemedText>
                         </TouchableOpacity>
                         <TouchableOpacity
                              style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
                              onPress={() => setFilterStatus('pending')}
                         >
                              <ThemedText style={styles.filterButtonText}>Đang chờ</ThemedText>
                         </TouchableOpacity>
                         <TouchableOpacity
                              style={[styles.filterButton, filterStatus === 'completed' && styles.filterButtonActive]}
                              onPress={() => setFilterStatus('completed')}
                         >
                              <ThemedText style={styles.filterButtonText}>Hoàn thành</ThemedText>
                         </TouchableOpacity>
                    </View>

                    {/* Sort */}
                    <View style={styles.filterGroup}>
                         <ThemedText style={styles.filterLabel}>Sắp xếp:</ThemedText>
                         <TouchableOpacity
                              style={[styles.filterButton, sortBy === 'dueDate' && styles.filterButtonActive]}
                              onPress={() => setSortBy('dueDate')}
                         >
                              <ThemedText style={styles.filterButtonText}>Hạn chót</ThemedText>
                         </TouchableOpacity>
                         <TouchableOpacity
                              style={[styles.filterButton, sortBy === 'subject' && styles.filterButtonActive]}
                              onPress={() => setSortBy('subject')}
                         >
                              <ThemedText style={styles.filterButtonText}>Môn học</ThemedText>
                         </TouchableOpacity>
                    </View>
               </View>

               <FlatList
                    data={filteredAndSortedHomeworks}
                    renderItem={renderHomeworkItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={
                         <ThemedText style={styles.emptyListText}>
                              Không có bài tập nào. Hãy thêm một bài tập mới!
                         </ThemedText>
                    }
               />

               <AddHomeworkModal
                    visible={modalVisible}
                    itemToEdit={itemToEdit}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveHomework}
                    onDelete={handleDeleteHomework}
               />
          </ThemedView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: '#f4f7f6',
          paddingHorizontal: 10,
          paddingTop: 10,
     },
     filterSortContainer: {
          marginBottom: 15,
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
     },
     filterGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
     },
     filterLabel: {
          fontSize: 15,
          fontWeight: 'bold',
          marginRight: 10,
          color: '#333',
     },
     filterButton: {
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#ccc',
          marginRight: 8,
          backgroundColor: '#f0f0f0',
     },
     filterButtonActive: {
          backgroundColor: '#3498db',
          borderColor: '#3498db',
     },
     filterButtonText: {
          color: '#333',
          fontWeight: '500',
     },
     flatListContent: {
          paddingBottom: 20,
     },
     homeworkItem: {
          backgroundColor: '#fff', // Nền trắng
          padding: 18, // Padding lớn hơn
          borderRadius: 10, // Bo góc nhiều hơn
          marginBottom: 12, // Khoảng cách dưới lớn hơn
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 }, // Đổ bóng sâu hơn
          shadowOpacity: 0.1, // Đổ bóng nhẹ hơn
          shadowRadius: 5, // Đổ bóng mềm hơn
          elevation: 4, // Android shadow
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeftWidth: 6, // Viền màu bên trái dày hơn
          // border color determined by getItemColor
     },
     overdueItem: {
          // backgroundColor: '#fde0e0', // Nền nhạt màu đỏ (tùy chọn)
     },
     homeworkContent: {
          flex: 1,
          marginRight: 15, // Khoảng cách giữa nội dung và icon
     },
     itemTitle: {
          fontSize: 17,
          fontWeight: 'bold',
          marginBottom: 4,
          color: '#333',
     },
     itemSubject: {
          fontSize: 14,
          color: '#555',
          marginBottom: 4,
     },
     itemDueDate: {
          fontSize: 14,
          color: '#777',
          fontWeight: 'bold', // Hạn chót cũng nên đậm
     },
     overdueText: {
          color: '#dc3545', // Màu đỏ cho chữ "QUÁ HẠN"
          fontWeight: 'bold',
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