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
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

// Import kiểu dữ liệu ScheduleEvent từ context - Đảm bảo đường dẫn đúng
import { ScheduleEvent } from '@/context/AppContext';


// Component đơn giản cho Checkbox Ngày trong tuần (giữ nguyên)
interface DayCheckboxProps {
     day: string; // Tên ngày hiển thị (ví dụ: 'T2')
     selected: boolean; // Trạng thái chọn
     onToggle: () => void; // Hàm xử lý khi nhấn
}

const DayCheckbox = ({ day, selected, onToggle }: DayCheckboxProps) => (
     <TouchableOpacity style={[styles.checkbox, selected && styles.checkboxSelected]} onPress={onToggle}>
          <ThemedText style={[styles.checkboxText, selected && styles.checkboxTextSelected]}>{day}</ThemedText>
     </TouchableOpacity>
);

// Mapping giữa tên ngày hiển thị và giá trị lưu trữ trong Context
const daysMap: { [key: string]: ScheduleEvent['daysOfWeek'][0] } = {
     'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed', 'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat', 'CN': 'Sun'
};
const daysOfWeekOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];


// Định nghĩa kiểu dữ liệu cho Modal Props
interface AddScheduleModalProps {
     visible: boolean;
     itemToEdit: ScheduleEvent | null; // Prop mới: Item lịch học cần sửa (hoặc null)
     onClose: () => void;
     onSave: (scheduleEvent: Omit<ScheduleEvent, 'id'> | ScheduleEvent) => void; // onSave nhận item mới hoặc đã sửa
     onDelete: (id: string) => void; // Prop mới: Hàm xóa
}

export default function AddScheduleModal({ visible, itemToEdit, onClose, onSave, onDelete }: AddScheduleModalProps) {
     const [subject, setSubject] = useState('');
     const [startTime, setStartTime] = useState(new Date());
     const [endTime, setEndTime] = useState(new Date());
     const [showStartTimePicker, setShowStartTimePicker] = useState(false);
     const [showEndTimePicker, setShowEndTimePicker] = useState(false);
     const [selectedDays, setSelectedDays] = useState<ScheduleEvent['daysOfWeek']>([]); // Sử dụng kiểu từ Context
     const [location, setLocation] = useState('');

     const isEditing = itemToEdit !== null; // Kiểm tra chế độ sửa/thêm

     // Effect để điền dữ liệu vào form khi sửa
     useEffect(() => {
          if (visible) {
               if (isEditing && itemToEdit) { // Đảm bảo itemToEdit tồn tại khi sửa
                    setSubject(itemToEdit.subject);
                    // Chuyển đổi string 'HH:mm' thành Date object tạm thời (chỉ lấy giờ phút)
                    const [startHour, startMinute] = itemToEdit.startTime.split(':').map(Number);
                    const [endHour, endMinute] = itemToEdit.endTime.split(':').map(Number);
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
                    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

                    setStartTime(start);
                    setEndTime(end);
                    setSelectedDays(itemToEdit.daysOfWeek); // Điền mảng ngày đã chọn
                    setLocation(itemToEdit.location);
               } else {
                    // Reset form khi thêm mới
                    setSubject('');
                    const now = new Date();
                    setStartTime(now);
                    const defaultEndTime = new Date(now.getTime() + 1.5 * 60 * 60 * 1000); // Giờ kết thúc mặc định 1.5h sau
                    setEndTime(defaultEndTime);
                    setSelectedDays([]);
                    setLocation('');
               }
          }
     }, [visible, itemToEdit, isEditing]);


     // Xử lý chọn ngày trong tuần (giữ nguyên)
     const handleToggleDay = (dayKey: ScheduleEvent['daysOfWeek'][0]) => { // Sử dụng kiểu từ Context
          setSelectedDays(prevSelectedDays => {
               if (prevSelectedDays.includes(dayKey)) {
                    return prevSelectedDays.filter(day => day !== dayKey);
               } else {
                    return [...prevSelectedDays, dayKey];
               }
          });
     };

     // Xử lý khi nhấn nút Lưu
     const handleSave = () => {
          if (!subject || selectedDays.length === 0 || !location) {
               Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin: Môn học, Ngày, và Địa điểm.'); // Dùng Alert thay vì alert()
               return;
          }

          const startTimeString = moment(startTime).format('HH:mm');
          const endTimeString = moment(endTime).format('HH:mm');

          const scheduleData = {
               subject,
               startTime: startTimeString,
               endTime: endTimeString,
               daysOfWeek: selectedDays,
               location,
          };

          if (isEditing) {
               if (itemToEdit) { // <--- KIỂM TRA itemToEdit an toàn hơn
                    // Nếu đang sửa, gọi onSave với item đã có ID
                    const updatedScheduleEvent: ScheduleEvent = {
                         id: itemToEdit.id, // Giữ nguyên ID
                         ...scheduleData,
                    };
                    onSave(updatedScheduleEvent);
               } else {
                    // Trường hợp này không nên xảy ra, nhưng log lỗi để debug
                    console.error("Lỗi (handleSave): Đang ở chế độ sửa nhưng itemToEdit là null/undefined");
                    Alert.alert("Lỗi", "Không thể lưu thay đổi. Dữ liệu không hợp lệ."); // Thông báo cho người dùng
                    return;
               }
          } else {
               // Nếu đang thêm mới, gọi onSave với dữ liệu chưa có ID (Context sẽ tạo ID)
               onSave(scheduleData as Omit<ScheduleEvent, 'id'>); // Ép kiểu an toàn
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
               "Bạn có chắc chắn muốn xóa lịch học này?",
               [
                    {
                         text: "Hủy",
                         style: "cancel"
                    },
                    {
                         text: "Xóa",
                         onPress: () => {
                              onDelete(itemToEdit.id); // Gọi hàm xóa
                              onClose(); // Đóng modal
                         },
                         style: "destructive" // Màu đỏ cho nút xóa trên iOS
                    }
               ]
          );
     };


     // Hàm xử lý thay đổi thời gian (cho cả start và end time)
     const onChangeTime = (event: any, selectedTime: Date | undefined, type: 'start' | 'end') => {
          if (Platform.OS === 'android') {
               if (type === 'start') setShowStartTimePicker(false);
               else setShowEndTimePicker(false);
          }

          if (selectedTime) {
               if (type === 'start') {
                    setStartTime(selectedTime);
               } else {
                    setEndTime(selectedTime);
               }
          }
          // Trên iOS, picker không tự đóng, cần nút Done hoặc logic phức tạp hơn
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
                              <ThemedText type="title">{isEditing ? 'Sửa Lịch học' : 'Thêm Lịch học mới'}</ThemedText>
                              {/* Nút đóng 'x' */}
                              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                   <Ionicons name="close-circle-outline" size={30} color="#555" />
                              </TouchableOpacity>
                         </View>

                         {/* Nội dung Form có thể cuộn */}
                         <ScrollView contentContainerStyle={styles.formScrollViewContent}>
                              {/* Trường Môn học */}
                              <ThemedText style={styles.label}>Môn học:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholder="Nhập môn học"
                                   placeholderTextColor="#999" // Thêm placeholder color
                              />

                              {/* Trường Thời gian */}
                              <ThemedText style={styles.label}>Thời gian:</ThemedText>
                              <View style={styles.timeContainer}>
                                   {/* Chọn giờ Bắt đầu */}
                                   <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.timePickerButton}>
                                        <ThemedText style={styles.timeText}>Bắt đầu: {moment(startTime).format('HH:mm')}</ThemedText>
                                   </TouchableOpacity>
                                   {showStartTimePicker && (
                                        <DateTimePicker
                                             testID="startTimePicker"
                                             value={startTime}
                                             mode="time"
                                             is24Hour={true}
                                             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                             onChange={(event, time) => onChangeTime(event, time, 'start')}
                                        />
                                   )}

                                   <ThemedText style={{ marginHorizontal: 10 }}>-</ThemedText>

                                   {/* Chọn giờ Kết thúc */}
                                   <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePickerButton}>
                                        <ThemedText style={styles.timeText}>Kết thúc: {moment(endTime).format('HH:mm')}</ThemedText>
                                   </TouchableOpacity>
                                   {showEndTimePicker && (
                                        <DateTimePicker
                                             testID="endTimePicker"
                                             value={endTime}
                                             mode="time"
                                             is24Hour={true}
                                             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                             onChange={(event, time) => onChangeTime(event, time, 'end')}
                                        />
                                   )}
                              </View>
                              {/* Trên iOS, cần nút Done hoặc logic xử lý riêng để đóng picker */}
                              {(showStartTimePicker || showEndTimePicker) && Platform.OS === 'ios' && (
                                   <Button title="Xong" onPress={() => { setShowStartTimePicker(false); setShowEndTimePicker(false); }} />
                              )}


                              {/* Trường Ngày trong tuần */}
                              <ThemedText style={styles.label}>Ngày trong tuần:</ThemedText>
                              <View style={styles.daysContainer}>
                                   {daysOfWeekOrder.map(dayName => (
                                        <DayCheckbox
                                             key={dayName}
                                             day={dayName}
                                             selected={selectedDays.includes(daysMap[dayName])} // Kiểm tra dựa trên giá trị lưu trữ
                                             onToggle={() => handleToggleDay(daysMap[dayName])} // Lưu giá trị lưu trữ
                                        />
                                   ))}
                              </View>


                              {/* Trường Địa điểm */}
                              <ThemedText style={styles.label}>Địa điểm:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={location}
                                   onChangeText={setLocation}
                                   placeholder="Nhập địa điểm (Ví dụ: Phòng A205)"
                                   placeholderTextColor="#999" // Thêm placeholder color
                              />

                              {/* Có thể thêm trường Giảng viên, Ngày bắt đầu/Kết thúc kỳ học sau này */}

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
                                   <Button title={isEditing ? "Lưu Thay đổi" : "Lưu Lịch học"} onPress={handleSave} color="#3498db" />
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền mờ
     },
     modalContent: {
          width: '90%', // Chiều rộng 90% màn hình
          maxHeight: '90%', // Chiều cao tối đa 90%
          borderRadius: 12, // Bo góc
          padding: 25, // Padding bên trong
          backgroundColor: '#fff', // Nền trắng
          shadowColor: '#000', // Đổ bóng iOS
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8, // Đổ bóng Android
     },
     modalHeader: { // Header (Tiêu đề và nút đóng)
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25,
          paddingBottom: 10, // Khoảng cách dưới header
          borderBottomWidth: 1, // Đường kẻ dưới header
          borderBottomColor: '#eee', // Màu đường kẻ
          // backgroundColor: 'transparent', // Đảm bảo trong suốt
     },
     closeButton: { // Nút đóng 'x'
          padding: 8, // Tăng vùng chạm
     },
     formScrollViewContent: { // Nội dung Form có thể cuộn
          paddingBottom: 30, // Khoảng trống dưới cùng ScrollView
     },
     label: { // Label cho các trường input
          fontSize: 15,
          marginBottom: 8,
          marginTop: 15, // Khoảng cách trên các label
          fontWeight: 'bold',
          color: '#333', // Màu chữ
          // backgroundColor: 'transparent',
     },
     input: { // Style chung cho TextInput
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          fontSize: 16,
          backgroundColor: '#f9f9f9',
          color: '#333',
          marginBottom: 15, // Khoảng cách dưới input
     },
     timePickerButton: { // Style cho nút chọn giờ
          flex: 1,
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#f9f9f9',
          alignItems: 'center',
     },
     timeContainer: { // Container cho 2 nút chọn giờ
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15, // Khoảng cách dưới
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
     statusToggle: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 15,
          marginBottom: 15,
          paddingVertical: 12,
          paddingHorizontal: 15,
          backgroundColor: '#f9f9f9',
          borderRadius: 8,
          borderColor: '#ccc',
          borderWidth: 1,
     },
     statusText: {
          marginLeft: 10,
          fontSize: 16,
          color: '#333',
     },
     modalFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          paddingTop: 15,
          borderTopWidth: 1,
          borderTopColor: '#eee',
     },
     deleteButton: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderRadius: 8,
          // Không border hay background mặc định để trông nhẹ nhàng
     },
     deleteButtonText: {
          color: '#dc3545',
          marginLeft: 5,
          fontSize: 16,
          fontWeight: 'bold',
     },
     saveButtonContainer: {
          flex: 1,
          marginLeft: 20,
     },
     timeText: {
          // Style riêng nếu cần, nhưng thường giống checkboxText
          fontSize: 16,
          color: '#333',
     },
     // Có thể thêm các style khác cần thiết từ file cũ
     notesInput: { // Style riêng cho Ghi chú trong HomeworkModal, thêm vào đây cho đầy đủ
          minHeight: 100,
          textAlignVertical: 'top',
     },
     dateDisplay: { // Style cho TouchableOpacity hiển thị ngày/giờ trong HomeworkModal
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#f9f9f9',
          justifyContent: 'center',
     },
});