import React, { useState, useEffect } from 'react';
import {
     StyleSheet,
     Modal,
     View,
     TextInput,
     Button,
     Platform,
     TouchableOpacity,
     ScrollView,
     Alert, // Import Alert
     Pressable, // Import Pressable
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
// Import ThemedView nếu bạn sử dụng trong Modal (code hiện tại không dùng)
// import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons cho trạng thái

// Import kiểu dữ liệu HomeworkItem từ context - Đảm bảo đường dẫn đúng
import { HomeworkItem } from '@/context/AppContext';


// Hàm helper lấy màu dựa trên trạng thái (ĐỊNH NGHĨA MỘT LẦN DUY NHẤT Ở ĐÂY)
const getStatusColor = (status: string) => {
     if (status === 'completed') return '#28a745'; // Green
     return '#ffc107'; // Yellow (pending default)
};

// Định nghĩa kiểu dữ liệu cho Modal Props
interface AddHomeworkModalProps {
     visible: boolean;
     itemToEdit: HomeworkItem | null; // Prop mới: Item bài tập cần sửa (hoặc null nếu đang thêm mới)
     onClose: () => void;
     onSave: (homework: Omit<HomeworkItem, 'id'> | HomeworkItem) => void; // onSave có thể nhận item mới hoặc item đã sửa
     onDelete: (id: string) => void; // Prop mới: Hàm xóa bài tập
}

export default function AddHomeworkModal({ visible, itemToEdit, onClose, onSave, onDelete }: AddHomeworkModalProps) {
     const [description, setDescription] = useState('');
     const [subject, setSubject] = useState('');
     const [dueDate, setDueDate] = useState(new Date());
     const [showDatePicker, setShowDatePicker] = useState(false);
     const [showTimePicker, setShowTimePicker] = useState(false);
     const [priority, setPriority] = useState<HomeworkItem['priority']>('medium');
     const [notes, setNotes] = useState('');
     const [status, setStatus] = useState<HomeworkItem['status']>('pending'); // State cho trạng thái

     const isEditing = itemToEdit !== null; // Kiểm tra xem đang ở chế độ sửa hay thêm

     // Effect để điền dữ liệu vào form khi modal mở ở chế độ sửa
     useEffect(() => {
          if (visible) {
               if (isEditing && itemToEdit) { // Đảm bảo itemToEdit tồn tại khi sửa
                    setDescription(itemToEdit.description);
                    setSubject(itemToEdit.subject);
                    setDueDate(moment(itemToEdit.dueDate).toDate()); // Chuyển ISO string thành Date object
                    setPriority(itemToEdit.priority);
                    setNotes(itemToEdit.notes);
                    setStatus(itemToEdit.status);
               } else {
                    // Reset form khi thêm mới
                    setDescription('');
                    setSubject('');
                    setDueDate(new Date());
                    setPriority('medium');
                    setNotes('');
                    setStatus('pending'); // Mặc định khi thêm mới
               }
          }
     }, [visible, itemToEdit, isEditing]); // Chạy lại khi visible hoặc itemToEdit thay đổi


     const onChangeDate = (event: any, selectedDate?: Date) => {
          const currentDate = selectedDate || dueDate;
          setShowDatePicker(Platform.OS === 'ios');
          setDueDate(currentDate);
          if (Platform.OS !== 'ios') {
               setShowTimePicker(true);
          }
     };

     const onChangeTime = (event: any, selectedTime?: Date) => {
          const currentTime = selectedTime || dueDate;
          setShowTimePicker(Platform.OS === 'ios');
          setDueDate(currentTime);
          if (Platform.OS === 'android') {
               setShowDatePicker(false);
          }
     };


     // Xử lý khi nhấn nút Lưu
     const handleSave = () => {
          if (!description || !subject) {
               Alert.alert('Lỗi', 'Vui lòng nhập Mô tả và Môn học.');
               return;
          }

          const homeworkData = {
               description,
               subject,
               dueDate: dueDate.toISOString(),
               priority,
               notes,
               status, // Lưu cả trạng thái
          };

          if (isEditing) {
               if (itemToEdit) { // <--- KIỂM TRA itemToEdit an toàn hơn
                    // Nếu đang sửa, gọi onSave với item đã có ID
                    const updatedHomework: HomeworkItem = {
                         id: itemToEdit.id, // Giữ nguyên ID
                         ...homeworkData,
                    };
                    onSave(updatedHomework);
               } else {
                    // Trường hợp này không nên xảy ra, nhưng log lỗi để debug
                    console.error("Lỗi (handleSave): Đang ở chế độ sửa nhưng itemToEdit là null/undefined");
                    Alert.alert("Lỗi", "Không thể lưu thay đổi. Dữ liệu không hợp lệ."); // Thông báo cho người dùng
                    return;
               }
          } else {
               // Nếu đang thêm mới, gọi onSave với dữ liệu chưa có ID (Context sẽ tạo ID)
               onSave(homeworkData as Omit<HomeworkItem, 'id'>); // Ép kiểu an toàn
          }

          onClose(); // Đóng modal sau khi lưu thành công
     };

     // Xử lý khi nhấn nút Xóa
     const handleDelete = () => {
          if (!isEditing || !itemToEdit) { // Chỉ xóa khi đang sửa VÀ itemToEdit tồn tại
               console.warn("Không thể xóa (handleDelete): Không ở chế độ sửa hoặc itemToEdit là null/undefined");
               Alert.alert("Lỗi", "Không thể xóa. Dữ liệu không hợp lệ.");
               return;
          }


          Alert.alert(
               "Xác nhận xóa",
               "Bạn có chắc chắn muốn xóa bài tập này?",
               [
                    {
                         text: "Hủy",
                         style: "cancel"
                    },
                    {
                         text: "Xóa",
                         onPress: () => {
                              onDelete(itemToEdit.id); // Gọi hàm xóa từ component cha
                              onClose(); // Đóng modal sau khi xóa
                         },
                         style: "destructive" // Màu đỏ cho nút xóa trên iOS
                    }
               ]
          );
     };

     // Hàm toggle trạng thái Hoàn thành/Chưa hoàn thành
     const toggleStatus = () => {
          setStatus(prevStatus => prevStatus === 'pending' ? 'completed' : 'pending');
     };


     return (
          <Modal
               visible={visible}
               animationType="slide"
               transparent={true}
               onRequestClose={onClose} // Xử lý nút Back cứng (Android)
          >
               {/* Vùng Overlay có thể chạm để đóng */}
               <TouchableOpacity // <-- SỬA Ở ĐÂY (Dùng TouchableOpacity/Pressable cho overlay)
                    style={styles.modalOverlay}
                    activeOpacity={1} // Quan trọng để nó không bị mờ khi chạm
                    onPress={onClose} // <-- Đặt onPress ở đây để đóng khi chạm NỀN MỜ
               >
                    {/* Vùng Nội dung Modal - Bọc trong Pressable để ngăn chặn sự kiện chạm làm đóng Modal */}
                    <Pressable // <-- BỌC NỘI DUNG Ở ĐÂY
                         style={styles.modalContent}
                         onPress={() => { }} // <-- Ngăn sự kiện chạm lan ra overlay
                    >
                         {/* Header của modal */}
                         <View style={styles.modalHeader}>
                              <ThemedText type="title">{isEditing ? 'Sửa Bài tập' : 'Thêm Bài tập mới'}</ThemedText>
                              {/* Nút đóng 'x' */}
                              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                   <Ionicons name="close-circle-outline" size={30} color="#555" />
                              </TouchableOpacity>
                         </View>

                         {/* Nội dung Form có thể cuộn */}
                         <ScrollView contentContainerStyle={styles.formScrollViewContent}>
                              {/* Trường Mô tả */}
                              <ThemedText style={styles.label}>Mô tả Bài tập:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={description}
                                   onChangeText={setDescription}
                                   placeholder="Nhập mô tả bài tập"
                                   placeholderTextColor="#999" // Thêm placeholder color
                              />

                              {/* Trường Môn học */}
                              <ThemedText style={styles.label}>Môn học:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholder="Nhập môn học"
                                   placeholderTextColor="#999" // Thêm placeholder color
                              />

                              {/* Trường Hạn chót */}
                              <ThemedText style={styles.label}>Hạn chót:</ThemedText>
                              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
                                   <ThemedText>{moment(dueDate).format('HH:mm, DD/MM/YYYY')}</ThemedText>
                              </TouchableOpacity>

                              {showDatePicker && (
                                   <DateTimePicker
                                        testID="datePicker"
                                        value={dueDate}
                                        mode="date"
                                        is24Hour={true}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeDate}
                                   />
                              )}
                              {showTimePicker && (
                                   <DateTimePicker
                                        testID="timePicker"
                                        value={dueDate}
                                        mode="time"
                                        is24Hour={true}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeTime}
                                   />
                              )}
                              {/* Nút Done cho cả 2 pickers trên iOS */}
                              {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                                   <Button title="Xong" onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }} />
                              )}


                              {/* Trường Ưu tiên */}
                              <ThemedText style={styles.label}>Mức độ ưu tiên:</ThemedText>
                              <View style={styles.pickerContainer}>
                                   <Picker
                                        selectedValue={priority}
                                        onValueChange={(itemValue, itemIndex) =>
                                             setPriority(itemValue as HomeworkItem['priority']) // Ép kiểu
                                        }
                                        style={styles.pickerStyle}
                                   // itemStyle={styles.pickerItem} // Chỉ dùng cho iOS
                                   >
                                        {/* CÁC PICKER.ITEM CÓ KHẢ NĂNG GÂY CẢNH BÁO VĂN BẢN TRỰC TIẾP */}
                                        <Picker.Item label="Thấp" value="low" />
                                        <Picker.Item label="Trung bình" value="medium" />
                                        <Picker.Item label="Cao" value="high" />
                                   </Picker>
                              </View>

                              {/* Trường Ghi chú */}
                              <ThemedText style={styles.label}>Ghi chú:</ThemedText>
                              <TextInput
                                   style={[styles.input, styles.notesInput]}
                                   value={notes}
                                   onChangeText={setNotes}
                                   placeholder="Ghi chú thêm (tùy chọn)"
                                   placeholderTextColor="#999" // Thêm placeholder color
                                   multiline={true}
                                   numberOfLines={4}
                              />

                              {/* Trường Trạng thái (Chỉ hiển thị khi sửa) */}
                              {isEditing && (
                                   <>
                                        <ThemedText style={styles.label}>Trạng thái:</ThemedText>
                                        <TouchableOpacity onPress={toggleStatus} style={styles.statusToggle}>
                                             <MaterialIcons
                                                  name={status === 'completed' ? 'check-circle' : 'circle'}
                                                  size={24}
                                                  color={getStatusColor(status)} // Sử dụng lại hàm màu status
                                             />
                                             <ThemedText style={styles.statusText}>
                                                  {status === 'completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                             </ThemedText>
                                        </TouchableOpacity>
                                   </>
                              )}


                         </ScrollView>

                         {/* Footer nút (Lưu và Xóa) */}
                         <View style={styles.modalFooter}>
                              {isEditing && (
                                   <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                                        <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                        <ThemedText style={styles.deleteButtonText}>Xóa</ThemedText>
                                   </TouchableOpacity>
                              )}
                              <View style={styles.saveButtonContainer}>
                                   <Button title={isEditing ? "Lưu Thay đổi" : "Lưu Bài tập"} onPress={handleSave} color="#3498db" />
                              </View>
                         </View>
                    </Pressable> {/* <-- KẾT THÚC Pressable */}
               </TouchableOpacity> {/* <-- KẾT THÚC TouchableOpacity */}
          </Modal>
     );
}

const styles = StyleSheet.create({
     modalOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ
     },
     modalContent: {
          width: '90%', // Chiều rộng 90% màn hình
          maxHeight: '90%', // Chiều cao tối đa 90%
          borderRadius: 10, // Bo góc
          padding: 20, // Padding bên trong
          backgroundColor: '#fff', // Nền trắng
          shadowColor: '#000', // Đổ bóng iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5, // Đổ bóng Android
     },
     modalHeader: { // Header (Tiêu đề và nút đóng)
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          // backgroundColor: 'transparent', // Đảm bảo trong suốt
     },
     closeButton: { // Nút đóng 'x'
          padding: 5,
     },
     formScrollViewContent: { // Nội dung Form có thể cuộn
          paddingBottom: 20, // Khoảng trống dưới cùng ScrollView
     },
     label: { // Label cho các trường input
          fontSize: 16,
          marginBottom: 8,
          marginTop: 10, // Khoảng cách trên các label
          fontWeight: 'bold',
          // backgroundColor: 'transparent',
     },
     input: { // Style chung cho TextInput
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          fontSize: 16,
          backgroundColor: '#f9f9f9',
          color: '#333',
     },
     notesInput: { // Style riêng cho Ghi chú (nhiều dòng)
          minHeight: 100, // Chiều cao tối thiểu
          textAlignVertical: 'top', // Căn text lên trên cho Android
     },
     dateDisplay: { // Style cho TouchableOpacity hiển thị ngày/giờ
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#f9f9f9',
          justifyContent: 'center',
     },
     pickerContainer: { // Style cho View bọc Picker
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 6,
          overflow: 'hidden', // Quan trọng để Picker không tràn ra ngoài border radius
          backgroundColor: '#f9f9f9',
     },
     pickerStyle: { // Style cho Picker component
          height: 40, // Chiều cao picker
          // width: Platform.OS === 'ios' ? 120 : 130, // Có thể set width nếu không dùng flex: 1
     },
     // pickerItem: { /* Chỉ dùng cho iOS, thường không cần thiết */ },
     statusToggle: { // Style cho nút toggle trạng thái
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          marginBottom: 10,
          padding: 10,
          backgroundColor: '#f9f9f9',
          borderRadius: 6,
          borderColor: '#ddd',
          borderWidth: 1,
     },
     statusText: { // Style cho text trạng thái
          marginLeft: 10,
          fontSize: 16,
     },
     modalFooter: { // Container cho các nút ở cuối modal
          flexDirection: 'row',
          justifyContent: 'space-between', // Đẩy nút xóa sang trái, nút lưu sang phải
          alignItems: 'center',
          marginTop: 20,
     },
     deleteButton: { // Style cho nút xóa
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          // Không border hay background mặc định để trông nhẹ nhàng
     },
     deleteButtonText: { // Style cho text nút xóa
          color: '#dc3545', // Màu đỏ
          marginLeft: 5,
          fontSize: 16,
     },
     saveButtonContainer: { // Container riêng cho nút lưu để style
          flex: 1, // Cho phép nút lưu chiếm không gian còn lại
          marginLeft: 20, // Khoảng cách với nút xóa
     },
     // Các style từ AddScheduleModal có thể cần cho style chung nếu muốn hợp nhất
     timePickerButton: { // Style cho nút chọn giờ
          flex: 1,
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#f9f9f9',
          alignItems: 'center',
     },
     timeText: { // Style cho text hiển thị giờ
          fontSize: 16,
          color: '#333',
     },
     timeContainer: { // Container cho 2 nút chọn giờ
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15,
     },
     daysContainer: { // Container cho các checkbox ngày
          flexDirection: 'row',
          flexWrap: 'wrap', // Cho phép xuống dòng
          marginBottom: 15,
          marginTop: 5,
     },
     checkbox: { // Style cho checkbox ngày
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 25, // Hình tròn hoặc oval
          borderWidth: 1,
          borderColor: '#ccc',
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: '#eee',
     },
     checkboxSelected: { // Style cho checkbox ngày khi được chọn
          backgroundColor: '#3498db',
          borderColor: '#3498db',
     },
     checkboxText: { // Style cho text checkbox ngày
          fontSize: 14,
          color: '#555',
     },
     checkboxTextSelected: { // Style cho text checkbox ngày khi được chọn
          color: '#fff',
          fontWeight: 'bold',
     },
});

// Hàm helper getStatusColor không cần định nghĩa lại ở đây vì đã có ở đầu file.