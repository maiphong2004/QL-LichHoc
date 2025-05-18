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

// Import Modal và Context
import AddHomeworkModal from '@/app/(tabs)/AddHomeworkModal'; // Đảm bảo đường dẫn đúng
import { HomeworkItem, useAppContext } from '@/context/AppContext'; // <-- SỬA ĐƯỜNG DẪN THÀNH @/context // Đảm bảo đường dẫn đúng


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

     // Màu cho trạng thái pending dựa trên ưu tiên (nếu bạn muốn dùng)
     // Hiện tại đang dùng màu cho pending là màu vàng viền, đỏ text
     // if (item.priority === 'high') return { borderColor: '#ffc107', textColor: '#e74c3c' }; // Vàng/Đỏ
     // if (item.priority === 'medium') return { borderColor: '#ffc107', textColor: '#555' }; // Vàng/Xám
     // if (item.priority === 'low') return { borderColor: '#ced4da', textColor: '#777' }; // Xám nhạt

     return {
          borderColor: '#ffc107', // Màu viền vàng cho pending
          textColor: '#e74c3c', // Màu text đỏ nhạt cho pending (có thể đổi sang màu khác)
     };
};


// Đây là component màn hình Bài tập được render bởi Navigator
// Chú ý: Nó KHÔNG nhận các props của Modal như visible, onClose, v.v.
export default function HomeworkScreen() {
     const navigation = useNavigation();
     // Lấy dữ liệu bài tập và các hàm thêm/sửa/xóa từ Context
     const { homework, addHomework, updateHomework, deleteHomework } = useAppContext();

     // State để quản lý Modal
     const [isModalVisible, setModalVisible] = useState(false);
     const [selectedItemToEdit, setSelectedItemToEdit] = useState<HomeworkItem | null>(null); // Lưu item đang chỉnh sửa

     // --- State cho Lọc và Sắp xếp ---
     const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending'); // Lọc theo trạng thái
     const [filterSubject, setFilterSubject] = useState<string>('all'); // State mới: Lọc theo môn học
     const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


     // --- Lấy danh sách các môn học duy nhất ---
     const uniqueSubjects = useMemo(() => {
          const subjects = homework.map(item => item.subject);
          const unique = Array.from(new Set(subjects));
          return ['all', ...unique.sort()]; // Thêm tùy chọn 'all' và sắp xếp A-Z
     }, [homework]);


     // --- Cấu hình nút Add ở Header ---
     useLayoutEffect(() => {
          navigation.setOptions({
               headerRight: () => (
                    <TouchableOpacity
                         style={{ marginRight: 15 }}
                         onPress={() => {
                              setSelectedItemToEdit(null); // Khi nhấn Add, là thêm mới
                              setModalVisible(true); // Mở Modal
                         }}
                    >
                         <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                    </TouchableOpacity>
               ),
               // Tiêu đề Header cho màn hình này
               title: 'Bài tập',
          });
     }, [navigation]);


     // --- Xử lý Dữ liệu (Lọc và Sắp xếp) ---
     const filteredAndSortedHomework = useMemo(() => {
          let result = [...homework];

          // 1. Lọc dữ liệu
          if (filterStatus !== 'all') {
               result = result.filter(item => item.status === filterStatus);
          }
          // Áp dụng bộ lọc theo môn học SAU bộ lọc trạng thái
          if (filterSubject !== 'all') {
               result = result.filter(item => item.subject === filterSubject);
          }

          // 2. Sắp xếp dữ liệu
          result.sort((a, b) => {
               if (sortBy === 'dueDate') {
                    const dateA = moment(a.dueDate);
                    const dateB = moment(b.dueDate);
                    if (sortOrder === 'asc') {
                         return dateA.diff(dateB); // Sắp xếp hạn chót tăng dần (gần nhất lên trước)
                    } else {
                         return dateB.diff(dateA); // Sắp xếp hạn chót giảm dần
                    }
               } else if (sortBy === 'priority') {
                    const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2 }; // Gán giá trị số cho ưu tiên
                    const priorityA = priorityOrder[a.priority];
                    const priorityB = priorityOrder[b.priority];

                    if (sortOrder === 'asc') {
                         return priorityA - priorityB; // Ưu tiên tăng dần (thấp lên trước)
                    } else {
                         return priorityB - priorityA; // Ưu tiên giảm dần (cao lên trước)
                    }
               }
               return 0; // Không thay đổi thứ tự nếu không khớp tiêu chí
          });

          return result;
     }, [homework, filterStatus, filterSubject, sortBy, sortOrder]); // Thêm filterSubject vào dependencies


     // --- Hàm render cho mỗi item bài tập ---
     const renderHomeworkItem = ({ item }: { item: HomeworkItem }) => {
          const itemColors = getItemColor(item);
          const isOverdue = moment(item.dueDate).isBefore(moment(), 'minute') && item.status === 'pending';

          return (
               <TouchableOpacity
                    style={[
                         styles.homeworkItem,
                         {
                              borderLeftColor: itemColors.borderColor, // Sử dụng borderLeftColor cho viền
                              opacity: item.status === 'completed' ? 0.6 : 1 // Giảm opacity nếu hoàn thành
                         },
                         isOverdue && styles.overdueItem // Áp dụng style riêng cho quá hạn nếu có
                    ]}
                    onPress={() => {
                         setSelectedItemToEdit(item); // Khi nhấn vào item, lưu item để sửa
                         setModalVisible(true); // Mở Modal
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
                              <MaterialIcons name="check-circle" size={24} color={itemColors.borderColor} /> // Icon hoàn thành
                         ) : (
                              <MaterialIcons name={isOverdue ? 'warning' : 'circle'} size={24} color={itemColors.borderColor} /> // Icon cảnh báo nếu quá hạn, icon chấm tròn nếu pending
                         )}
                    </View>
               </TouchableOpacity>
          );
     };


     return (
          <ThemedView style={styles.container}>
               {/* --- Bộ lọc và Sắp xếp Controls --- */}
               {/* Bạn có thể copy style từ HomeworkScreen trước đó để làm đẹp phần này */}
               <View style={styles.controlsContainer}>
                    {/* Lọc theo Trạng thái */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Trạng thái:</ThemedText>
                         <Picker
                              selectedValue={filterStatus}
                              onValueChange={(itemValue) => setFilterStatus(itemValue as 'all' | 'pending' | 'completed')}
                              style={styles.pickerStyle}
                         // itemStyle={styles.pickerItem} // Chỉ dùng cho iOS
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
                         // itemStyle={styles.pickerItem} // Chỉ dùng cho iOS
                         >
                              {uniqueSubjects.map(subject => (
                                   <Picker.Item key={subject} label={subject === 'all' ? 'Tất cả Môn' : subject} value={subject} />
                              ))}
                         </Picker>
                    </View>

                    {/* Sắp xếp theo */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Sắp xếp:</ThemedText>
                         <Picker
                              selectedValue={sortBy}
                              onValueChange={(itemValue) => setSortBy(itemValue as 'dueDate' | 'priority')}
                              style={styles.pickerStyle}
                         // itemStyle={styles.pickerItem} // Chỉ dùng cho iOS
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

                    {/* Thứ tự Sắp xếp (Tăng/Giảm) */}
                    <View style={styles.pickerWrapper}>
                         <ThemedText style={styles.controlLabel}>Thứ tự:</ThemedText>
                         <Picker
                              selectedValue={sortOrder}
                              onValueChange={(itemValue) => setSortOrder(itemValue as 'asc' | 'desc')}
                              style={styles.pickerStyle}
                         // itemStyle={styles.pickerItem} // Chỉ dùng cho iOS
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
                         data={filteredAndSortedHomework} // Sử dụng dữ liệu đã lọc và sắp xếp
                         keyExtractor={(item) => item.id}
                         renderItem={renderHomeworkItem}
                         contentContainerStyle={styles.flatListContent}
                    />
               ) : (
                    <View style={styles.emptyStateContainer}>
                         {/* Sửa: Bọc chuỗi text tĩnh trong ThemedText */}
                         <ThemedText type="default" style={styles.emptyStateText}>
                              {homework.length > 0 ? 'Không tìm thấy bài tập phù hợp với bộ lọc.' : 'Chưa có bài tập nào được thêm.'}
                         </ThemedText>
                         {/* Sửa: Bọc chuỗi text tĩnh trong ThemedText */}
                         {homework.length === 0 && (
                              <ThemedText type="default" style={styles.emptyStateText}>
                                   Nhấn nút "+" ở góc trên để thêm mới!
                              </ThemedText>
                         )}
                    </View>
               )}


               {/* Modal thêm/sửa bài tập */}
               {/* Modal hiển thị nếu state isModalVisible là true */}
               <AddHomeworkModal
                    visible={isModalVisible} // Lấy từ state
                    itemToEdit={selectedItemToEdit} // Lấy từ state
                    onClose={() => { // Hàm đóng modal
                         setModalVisible(false);
                         setSelectedItemToEdit(null); // Reset item đang chỉnh sửa
                    }}
                    onSave={(homeworkData) => { // Hàm xử lý lưu từ modal
                         if (selectedItemToEdit && 'id' in homeworkData) {
                              // Nếu đang sửa, gọi update
                              updateHomework(homeworkData as HomeworkItem);
                         } else {
                              // Nếu thêm mới, gọi add
                              addHomework(homeworkData as Omit<HomeworkItem, 'id'>);
                         }
                         setModalVisible(false); // Đóng modal sau khi lưu
                         setSelectedItemToEdit(null);
                    }}
                    onDelete={(id) => { // Hàm xử lý xóa từ modal
                         deleteHomework(id);
                         // Gọi setModalVisible(false) để đóng modal sau khi nhấn xóa
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
     controlsContainer: { // Container cho bộ lọc và sắp xếp
          flexDirection: 'row',
          justifyContent: 'space-around', // Căn đều các Picker
          alignItems: 'center',
          padding: 10,
          backgroundColor: '#ecf0f1', // Màu nền nhẹ
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
          flexWrap: 'wrap', // Cho phép xuống dòng nếu nhiều controls
     },
     pickerWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          // width: '30%', // Có thể điều chỉnh chiều rộng hoặc để flex
          // minWidth: 120, // Chiều rộng tối thiểu
          flexBasis: Platform.OS === 'ios' ? 140 : 150, // Flex basis cho mỗi picker wrapper
          marginHorizontal: 5, // Khoảng cách giữa các picker wrapper
          marginBottom: 5, // Khoảng cách dưới nếu wrap
          // borderWidth: 1, borderColor: '#ccc', borderRadius: 8, // Thêm border cho picker wrapper nếu muốn
     },
     controlLabel: {
          fontSize: 14,
          marginRight: 5,
          fontWeight: 'bold',
          color: '#555',
     },
     pickerStyle: { // Style cho Picker component
          height: 40,
          flex: 1, // Cho phép picker chiếm phần còn lại của wrapper
          // width: Platform.OS === 'ios' ? 120 : 130, // Bỏ width cố định khi dùng flex: 1
     },
     pickerItem: {
          // fontSize: 14,
          // color: '#333',
     },
     flatListContent: {
          paddingHorizontal: 15, // Padding ngang danh sách
          paddingVertical: 10, // Padding dọc danh sách
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
     homeworkItem: { // Cập nhật style cho mỗi item bài tập
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
          // backgroundColor: '#f8d7da', // Nền nhạt màu đỏ (tùy chọn)
     },
     homeworkContent: {
          flex: 1,
          marginRight: 15, // Khoảng cách giữa nội dung và icon
     },
     itemTitle: { // Style cho tiêu đề bài tập
          fontSize: 17, // Font size lớn hơn
          fontWeight: 'bold',
          marginBottom: 4,
          color: '#333', // Màu chữ rõ ràng
     },
     itemSubject: { // Style cho môn học
          fontSize: 14,
          color: '#555', // Màu chữ xám
          marginBottom: 4,
     },
     itemDueDate: { // Style cho hạn chót
          fontSize: 14,
          fontWeight: 'bold',
          // Color determined by getItemColor (đã có logic màu đỏ/màu khác)
     },
     statusIconContainer: {
          paddingLeft: 10, // Khoảng cách trái cho icon container
     }
});