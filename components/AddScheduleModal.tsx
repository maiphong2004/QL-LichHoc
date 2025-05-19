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
     Alert,
     Pressable,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView'; // Giữ lại nếu ThemedView được dùng ở đâu đó trong modal style
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

// Import kiểu dữ liệu ScheduleEvent từ context
import { ScheduleEvent } from '@/context/AppContext';


// Component đơn giản cho Checkbox Ngày trong tuần
interface DayCheckboxProps {
     day: string;
     selected: boolean;
     onToggle: () => void;
}

const DayCheckbox = ({ day, selected, onToggle }: DayCheckboxProps) => (
     <TouchableOpacity style={[styles.checkbox, selected && styles.checkboxSelected]} onPress={onToggle}>
          <ThemedText style={[styles.checkboxText, selected && styles.checkboxTextSelected]}>{day}</ThemedText>
     </TouchableOpacity>
);

// Mapping giữa tên ngày hiển thị và giá trị lưu trữ trong Context
const daysMap: { [key: string]: ScheduleEvent['daysOfWeek'][0] } = {
     'Mon': 'Thứ Hai', 'Tue': 'Thứ Ba', 'Wed': 'Thứ Tư', 'Thu': 'Thứ Năm', 'Fri': 'Thứ Sáu', 'Sat': 'Thứ Bảy', 'Sun': 'Chủ Nhật'
};
const daysOfWeekOrder = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];


// Định nghĩa kiểu dữ liệu cho Modal Props
interface AddScheduleModalProps {
     visible: boolean;
     itemToEdit: ScheduleEvent | null;
     onClose: () => void;
     onSave: (scheduleEvent: Omit<ScheduleEvent, 'id'> | ScheduleEvent) => void;
     onDelete: (id: string) => void;
}

export default function AddScheduleModal({ visible, itemToEdit, onClose, onSave, onDelete }: AddScheduleModalProps) {
     const [subject, setSubject] = useState('');
     const [startTime, setStartTime] = useState(new Date());
     const [endTime, setEndTime] = useState(new Date());
     const [showStartTimePicker, setShowStartTimePicker] = useState(false);
     const [showEndTimePicker, setShowEndTimePicker] = useState(false);
     const [selectedDays, setSelectedDays] = useState<ScheduleEvent['daysOfWeek']>([]);
     const [location, setLocation] = useState('');

     const isEditing = itemToEdit !== null;

     // Effect để điền dữ liệu vào form khi sửa
     useEffect(() => {
          if (visible) {
               if (isEditing && itemToEdit) {
                    setSubject(itemToEdit.subject);
                    const [startHour, startMinute] = itemToEdit.startTime.split(':').map(Number);
                    const [endHour, endMinute] = itemToEdit.endTime.split(':').map(Number);
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
                    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

                    setStartTime(start);
                    setEndTime(end);
                    setSelectedDays(itemToEdit.daysOfWeek);
                    setLocation(itemToEdit.location);
               } else {
                    // Reset form khi thêm mới
                    setSubject('');
                    const now = new Date();
                    setStartTime(now);
                    const defaultEndTime = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
                    setEndTime(defaultEndTime);
                    setSelectedDays([]);
                    setLocation('');
               }
          }
     }, [visible, itemToEdit, isEditing]);


     // Xử lý chọn ngày trong tuần
     const handleToggleDay = (dayKey: ScheduleEvent['daysOfWeek'][0]) => {
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
               Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin: Môn học, Ngày, và Địa điểm.');
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
               if (itemToEdit) {
                    const updatedScheduleEvent: ScheduleEvent = {
                         id: itemToEdit.id,
                         ...scheduleData,
                    };
                    onSave(updatedScheduleEvent);
               } else {
                    console.error("Lỗi (handleSave): Đang ở chế độ sửa nhưng itemToEdit là null/undefined");
                    Alert.alert("Lỗi", "Không thể lưu thay đổi. Dữ liệu không hợp lệ.");
                    return;
               }
          } else {
               onSave(scheduleData as Omit<ScheduleEvent, 'id'>);
          }

          onClose();
     };

     // Xử lý khi nhấn nút Xóa
     const handleDelete = () => {
          if (!isEditing || !itemToEdit) {
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
                              onDelete(itemToEdit.id);
                              onClose();
                         },
                         style: "destructive"
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
               onRequestClose={onClose}
          >
               <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClose}
               >
                    <Pressable
                         style={styles.modalContent}
                         onPress={() => { }}
                    >
                         <View style={styles.modalHeader}>
                              <ThemedText type="title">{isEditing ? 'Sửa Lịch học' : 'Thêm Lịch học mới'}</ThemedText>
                              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                   <Ionicons name="close-circle-outline" size={30} color="#555" />
                              </TouchableOpacity>
                         </View>

                         <ScrollView contentContainerStyle={styles.formScrollViewContent}>
                              <ThemedText style={styles.label}>Môn học:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholder="Nhập môn học"
                                   placeholderTextColor="#999"
                              />

                              <ThemedText style={styles.label}>Thời gian:</ThemedText>
                              <View style={styles.timeContainer}>
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
                              {(showStartTimePicker || showEndTimePicker) && Platform.OS === 'ios' && (
                                   <Button title="Xong" onPress={() => { setShowStartTimePicker(false); setShowEndTimePicker(false); }} />
                              )}


                              <ThemedText style={styles.label}>Ngày trong tuần:</ThemedText>
                              <View style={styles.daysContainer}>
                                   {daysOfWeekOrder.map(dayName => (
                                        <DayCheckbox
                                             key={dayName}
                                             day={dayName}
                                             selected={selectedDays.includes(daysMap[dayName])}
                                             onToggle={() => handleToggleDay(daysMap[dayName])}
                                        />
                                   ))}
                              </View>


                              <ThemedText style={styles.label}>Địa điểm:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={location}
                                   onChangeText={setLocation}
                                   placeholder="Nhập địa điểm (Ví dụ: Phòng A205)"
                                   placeholderTextColor="#999"
                              />

                         </ScrollView>

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
                    </Pressable>
               </TouchableOpacity>
          </Modal>
     );
}

const styles = StyleSheet.create({
     modalOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
     },
     modalContent: {
          width: '90%',
          maxHeight: '90%',
          borderRadius: 12,
          padding: 25,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
     },
     modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
     },
     closeButton: {
          padding: 8,
     },
     formScrollViewContent: {
          paddingBottom: 30,
     },
     label: {
          fontSize: 15,
          marginBottom: 8,
          marginTop: 15,
          fontWeight: 'bold',
          color: '#333',
     },
     input: {
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          fontSize: 16,
          backgroundColor: '#f9f9f9',
          color: '#333',
          marginBottom: 15,
     },
     timePickerButton: {
          flex: 1,
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#f9f9f9',
          alignItems: 'center',
     },
     timeContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 15,
     },
     daysContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 15,
          marginTop: 5,
     },
     checkbox: {
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: '#ccc',
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: '#eee',
     },
     checkboxSelected: {
          backgroundColor: '#3498db',
          borderColor: '#3498db',
     },
     checkboxText: {
          fontSize: 14,
          color: '#555',
     },
     checkboxTextSelected: {
          color: '#fff',
          fontWeight: 'bold',
     },
     statusToggle: { // Style from HomeworkModal, included for completeness
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
     statusText: { // Style from HomeworkModal, included for completeness
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
     timeText: { // Style for time text display in buttons
          fontSize: 16,
          color: '#333',
     },
     notesInput: { // Style from HomeworkModal, included for completeness
          minHeight: 100,
          textAlignVertical: 'top',
     },
     dateDisplay: { // Style from HomeworkModal, included for completeness
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#f9f9f9',
          justifyContent: 'center',
     },
});