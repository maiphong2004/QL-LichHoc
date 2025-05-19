import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/vi';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
moment.locale('vi');

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Import Modal và Context - Đảm bảo đường dẫn đúng
import AddHomeworkModal from '../../components/AddHomeworkModal'; // Đường dẫn tương đối trong cùng thư mục (tabs)
import { HomeworkItem, useAppContext } from '@/context/AppContext'; // Đường dẫn tuyệt đối đến context


// Hàm helper định dạng ngày hạn chót
const formatDueDate = (dateString: string) => {
     const date = moment(dateString);
     // Kiểm tra nếu đã quá hạn (dueDate trước thời gian hiện tại) VÀ trạng thái chưa hoàn thành
     if (date.isBefore(moment(), 'minute') && !moment(dateString).isSame(moment(), 'day')) {
          return 'QUÁ HẠN: ' + date.format('HH:mm, DD/MM/YYYY');
     }
     if (date.isSame(moment(), 'day')) {
          return 'Hôm nay, ' + date.format('HH:mm');
     } else if (date.isSame(moment().add(1, 'day'), 'day')) {
          return 'Ngày mai, ' + date.format('HH:mm');
     } else {
          return date.format('HH:mm, DD/MM/YYYY');
     }
};

// Hàm helper lấy màu dựa trên trạng thái hoặc ưu tiên HOẶC QUÁ HẠN
const getItemColor = (item: HomeworkItem) => {
     const dueDate = moment(item.dueDate);
     const isOverdue = dueDate.isBefore(moment(), 'minute') && item.status === 'pending';

     if (isOverdue) {
          return {
               borderColor: '#dc3545', // Đỏ cho quá hạn
               textColor: '#dc3545', // Đỏ cho text quá hạn
          };
     }

     if (item.status === 'completed') {
          return {
               borderColor: '#28a745', // Xanh lá cho đã hoàn thành
               textColor: '#28a745', // Xanh lá cho text đã hoàn thành
          };
     }

     // Màu cho trạng thái pending
     return {
          borderColor: '#ffc107', // Màu viền vàng cho pending
          textColor: '#e74c3c', // Màu text đỏ nhạt cho pending
     };
};


// Đây là component màn hình Bài tập được render bởi Navigator
export default function HomeworkScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu bài tập và các hàm thêm/sửa/xóa từ Context
     const { homework, addHomework, updateHomework, deleteHomework } = useAppContext();

     // State để quản lý Modal
     const [isModalVisible, setModalVisible] = useState(false);
     const [selectedItemToEdit, setSelectedItemToEdit] = useState<HomeworkItem | null>(null);

     // --- State cho Lọc và Sắp xếp ---
     const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
     const [filterSubject, setFilterSubject] = useState<string>('all');
     const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


     // --- Lấy danh sách các môn học duy nhất ---
     const uniqueSubjects = useMemo(() => {
          const subjects = homework.map(item => item.subject);
          const unique = Array.from(new Set(subjects));
          return ['all', ...unique.sort()];
     }, [homework]);


     // --- Cấu hình nút Add ở Header ---
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
               title: 'Bài tập', // Tiêu đề Header cho màn hình này
          });
     }, [navigation]);


     // --- Xử lý Dữ liệu (Lọc và Sắp xếp) ---
     const filteredAndSortedHomework = useMemo(() => {
          let result = [...homework];

          // 1. Lọc dữ liệu
          if (filterStatus !== 'all') {
               result = result.filter(item => item.status === filterStatus);
          }
          if (filterSubject !== 'all') {
               result = result.filter(item => item.subject === filterSubject);
          }

          // 2. Sắp xếp dữ liệu
          result.sort((a, b) => {
               if (sortBy === 'dueDate') {
                    const dateA = moment(a.dueDate);
                    const dateB = moment(b.dueDate);
                    if (sortOrder === 'asc') {
                         return dateA.diff(dateB);
                    } else {
                         return dateB.diff(dateA);
                    }
               } else if (sortBy === 'priority') {
                    const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2 };
                    const priorityA = priorityOrder[a.priority];
                    const priorityB = priorityOrder[b.priority];

                    if (sortOrder === 'asc') {
                         return priorityA - priorityB;
                    } else {
                         return priorityB - priorityA;
                    }
               }
               return 0;
          });

          return result;
     }, [homework, filterStatus, filterSubject, sortBy, sortOrder]);


     // --- Hàm render cho mỗi item bài tập ---
     const renderHomeworkItem = ({ item }: { item: HomeworkItem }) => {
          const itemColors = getItemColor(item);
          const isOverdue = moment(item.dueDate).isBefore(moment(), 'minute') && item.status === 'pending';

          return (
               <TouchableOpacity
                    style={[
                         styles.homeworkItem,
                         {
                              borderLeftColor: itemColors.borderColor,
                              opacity: item.status === 'completed' ? 0.6 : 1
                         },
                         isOverdue && styles.overdueItem
                    ]}
                    onPress={() => {
                         setSelectedItemToEdit(item);
                         setModalVisible(true);
                    }}
               >
                    <View style={styles.homeworkContent}>
                         <ThemedText type="defaultSemiBold" style={styles.itemTitle}>{item.description}</ThemedText>
                         <ThemedText style={styles.itemSubject}>{item.subject}</ThemedText>
                         <ThemedText style={[styles.itemDueDate, { color: itemColors.textColor }]}>
                              {formatDueDate(item.dueDate)}
                         </ThemedText>
                    </View>
                    <View style={styles.statusIconContainer}>
                         {item.status === 'completed' ? (
                              <MaterialIcons name="check-circle" size={24} color={itemColors.borderColor} />
                         ) : (
                              <MaterialIcons name={isOverdue ? 'warning' : 'circle'} size={24} color={itemColors.borderColor} />
                         )}
                    </View>
               </TouchableOpacity>
          );
     };


     return (
          <ThemedView style={styles.container}>
               {/* --- Bộ lọc và Sắp xếp Controls --- */}
               <View style={styles.controlsContainer}>
                    {/* Lọc theo Trạng thái */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Trạng thái:</ThemedText>
                         <Picker
                              selectedValue={filterStatus}
                              onValueChange={(itemValue) => setFilterStatus(itemValue as 'all' | 'pending' | 'completed')}
                              style={styles.pickerStyle}
                         >
                              <Picker.Item label="Tất cả" value="all" />
                              <Picker.Item label="Chưa xong" value="pending" />
                              <Picker.Item label="Đã xong" value="completed" />
                         </Picker>
                    </View>

                    {/* Bộ lọc theo Môn học */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Môn học:</ThemedText>
                         <Picker
                              selectedValue={filterSubject}
                              onValueChange={(itemValue) => setFilterSubject(itemValue)}
                              style={styles.pickerStyle}
                         >
                              {uniqueSubjects.map(subject => (
                                   <Picker.Item key={subject} label={subject === 'all' ? 'Tất cả Môn' : subject} value={subject} />
                              ))}
                         </Picker>
                    </View>

                    {/* Sắp xếp theo */}
                    {/* Chú ý: Picker thứ 3 và thứ 4 trong code gốc dường như cùng xử lý "Sắp xếp" và "Thứ tự".
                         Tôi sẽ giữ nguyên như code gốc, nhưng bạn có thể cân nhắc hợp nhất logic này nếu phù hợp hơn. */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Sắp xếp:</ThemedText>
                         <Picker
                              selectedValue={sortBy}
                              onValueChange={(itemValue) => setSortBy(itemValue as 'dueDate' | 'priority')}
                              style={styles.pickerStyle}
                         >
                              {/* Các tùy chọn trong Picker này sẽ thay đổi based on selected SortBy in the next picker */}
                              <Picker.Item label="Hạn chót" value="dueDate" />
                              <Picker.Item label="Ưu tiên" value="priority" />
                         </Picker>
                    </View>

                    {/* Thứ tự Sắp xếp (Tăng/Giảm) */}
                    {/* Picker này nên điều khiển thứ tự (asc/desc) cho tiêu chí đã chọn ở Picker "Sắp xếp theo" */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Thứ tự:</ThemedText>
                         <Picker
                              selectedValue={sortOrder}
                              onValueChange={(itemValue) => setSortOrder(itemValue as 'asc' | 'desc')}
                              style={styles.pickerStyle}
                         >
                              {sortBy === 'dueDate' ? (
                                   <>
                                        <Picker.Item label="Gần nhất" value="asc" />
                                        <Picker.Item label="Xa nhất" value="desc" />
                                   </>
                              ) : (
                                   <>
                                        <Picker.Item label="Thấp đến Cao" value="asc" />
                                        <Picker.Item label="Cao đến Thấp" value="desc" />
                                   </>
                              )}
                         </Picker>
                    </View>
               </View>


               {/* --- Danh sách Bài tập --- */}
               {filteredAndSortedHomework.length > 0 ? (
                    <FlatList
                         data={filteredAndSortedHomework}
                         keyExtractor={(item) => item.id}
                         renderItem={renderHomeworkItem}
                         contentContainerStyle={styles.flatListContent}
                    />
               ) : (
                    <View style={styles.emptyStateContainer}>
                         <ThemedText type="default" style={styles.emptyStateText}>
                              {homework.length > 0 ? 'Không tìm thấy bài tập phù hợp với bộ lọc.' : 'Chưa có bài tập nào được thêm.'}
                         </ThemedText>
                         {homework.length === 0 && (
                              <ThemedText type="default" style={styles.emptyStateText}>
                                   Nhấn nút "+" ở góc trên để thêm mới!
                              </ThemedText>
                         )}
                    </View>
               )}


               {/* Modal thêm/sửa bài tập */}
               <AddHomeworkModal
                    visible={isModalVisible}
                    itemToEdit={selectedItemToEdit}
                    onClose={() => {
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
                    onSave={(homeworkData) => {
                         if (selectedItemToEdit && 'id' in homeworkData) {
                              updateHomework(homeworkData as HomeworkItem);
                         } else {
                              addHomework(homeworkData as Omit<HomeworkItem, 'id'>);
                         }
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
                    onDelete={(id) => {
                         deleteHomework(id);
                         setModalVisible(false);
                         setSelectedItemToEdit(null);
                    }}
               />
          </ThemedView>
     );
}

// Định nghĩa styles cho màn hình Bài tập
const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: '#f4f7f6',
     },
     controlsContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: 10,
          backgroundColor: '#ecf0f1',
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
          flexWrap: 'wrap',
     },
     pickerWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          flexBasis: Platform.OS === 'ios' ? 140 : 150,
          marginHorizontal: 5,
          marginBottom: 5,
     },
     controlLabel: {
          fontSize: 14,
          marginRight: 5,
          fontWeight: 'bold',
          color: '#555',
     },
     pickerStyle: {
          height: 40,
          flex: 1,
     },
     flatListContent: {
          paddingHorizontal: 15,
          paddingVertical: 10,
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
     homeworkItem: {
          backgroundColor: '#fff',
          padding: 18,
          borderRadius: 10,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 4,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeftWidth: 6,
     },
     overdueItem: {
          // backgroundColor: '#f8d7da', // Optional
     },
     homeworkContent: {
          flex: 1,
          marginRight: 15,
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
          fontWeight: 'bold',
     },
     statusIconContainer: {
          paddingLeft: 10,
     }
});