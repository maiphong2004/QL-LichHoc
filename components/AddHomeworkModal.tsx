// components/AddHomeworkModal.tsx
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
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker'; // Không cần Picker ở đây nữa
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import kiểu dữ liệu HomeworkItem từ context
import { HomeworkItem } from '@/context/AppContext';

// Hàm helper lấy màu dựa trên trạng thái
const getStatusColor = (status: string) => {
     if (status === 'completed') return '#28a745'; // Green
     return '#ffc107'; // Yellow (pending default)
};

// Định nghĩa kiểu dữ liệu cho Modal Props
interface AddHomeworkModalProps {
     visible: boolean;
     itemToEdit: HomeworkItem | null; // Item bài tập cần sửa (hoặc null nếu đang thêm mới)
     onClose: () => void;
     onSave: (homework: Omit<HomeworkItem, 'id'> | HomeworkItem) => void; // onSave có thể nhận item mới hoặc item đã sửa
     onDelete: (id: string) => void;
}

const AddHomeworkModal: React.FC<AddHomeworkModalProps> = ({
     visible,
     itemToEdit,
     onClose,
     onSave,
     onDelete,
}) => {
     const [description, setDescription] = useState('');
     const [subject, setSubject] = useState('');
     const [dueDate, setDueDate] = useState(new Date());
     const [status, setStatus] = useState<'pending' | 'completed'>('pending');
     const [notes, setNotes] = useState('');
     const [showDatePicker, setShowDatePicker] = useState(false);
     const [showTimePicker, setShowTimePicker] = useState(false);

     // Thêm state để lưu notificationId nếu có (từ itemToEdit)
     const [notificationId, setNotificationId] = useState<string | undefined>(undefined);

     useEffect(() => {
          if (itemToEdit) {
               setDescription(itemToEdit.description);
               setSubject(itemToEdit.subject);
               setDueDate(moment(itemToEdit.dueDate).toDate());
               setStatus(itemToEdit.status);
               setNotes(itemToEdit.notes || '');
               setNotificationId(itemToEdit.notificationId); // Tải notificationId từ itemToEdit
          } else {
               // Reset form khi thêm mới
               setDescription('');
               setSubject('');
               setDueDate(new Date());
               setStatus('pending');
               setNotes('');
               setNotificationId(undefined); // Reset notificationId khi thêm mới
          }
     }, [itemToEdit, visible]); // Thêm 'visible' vào dependency array để reset khi mở modal

     const handleDateChange = (event: any, selectedDate?: Date) => {
          const currentDate = selectedDate || dueDate;
          setShowDatePicker(Platform.OS === 'ios');
          setDueDate(currentDate);
     };

     const handleTimeChange = (event: any, selectedTime?: Date) => {
          const currentTime = selectedTime || dueDate;
          setShowTimePicker(Platform.OS === 'ios');
          setDueDate(currentTime);
     };

     const handleSave = () => {
          if (!description.trim() || !subject.trim()) {
               Alert.alert('Lỗi', 'Vui lòng nhập mô tả và môn học.');
               return;
          }

          // Tạo đối tượng bài tập để truyền lên onSave
          const homeworkData: Omit<HomeworkItem, 'id'> | HomeworkItem = itemToEdit
               ? {
                    ...itemToEdit, // Giữ lại ID và các thuộc tính khác của itemToEdit
                    description,
                    subject,
                    dueDate: moment(dueDate).toISOString(), // Lưu dưới dạng ISO string
                    status,
                    notes,
                    notificationId, // Đảm bảo notificationId được truyền đi khi cập nhật
               }
               : {
                    description,
                    subject,
                    dueDate: moment(dueDate).toISOString(),
                    status,
                    notes,
                    // notificationId sẽ được gán trong AppContext khi thêm mới
               };
          onSave(homeworkData);
          onClose();
     };

     const handleDelete = () => {
          if (itemToEdit) {
               Alert.alert(
                    'Xác nhận xóa',
                    `Bạn có chắc chắn muốn xóa bài tập "${itemToEdit.description}"?`,
                    [
                         {
                              text: 'Hủy',
                              style: 'cancel',
                         },
                         {
                              text: 'Xóa',
                              onPress: () => {
                                   onDelete(itemToEdit.id);
                                   onClose();
                              },
                              style: 'destructive',
                         },
                    ],
               );
          }
     };

     return (
          <Modal
               animationType="slide"
               transparent={true}
               visible={visible}
               onRequestClose={onClose}
          >
               <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                         <ScrollView contentContainerStyle={styles.scrollViewContent}>
                              <ThemedText style={styles.modalTitle}>
                                   {itemToEdit ? 'Sửa bài tập' : 'Thêm bài tập mới'}
                              </ThemedText>

                              <TextInput
                                   style={styles.input}
                                   placeholder="Mô tả bài tập (ví dụ: Làm bài tập chương 1)"
                                   value={description}
                                   onChangeText={setDescription}
                                   placeholderTextColor="#888"
                              />
                              <TextInput
                                   style={styles.input}
                                   placeholder="Môn học (ví dụ: Toán cao cấp)"
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholderTextColor="#888"
                              />

                              <ThemedText style={styles.label}>Ngày và giờ hết hạn:</ThemedText>
                              <View style={styles.dateTimeContainer}>
                                   <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        style={styles.datePickerButton}
                                   >
                                        <Ionicons name="calendar-outline" size={20} color="#3498db" />
                                        <ThemedText style={styles.dateText}>
                                             {moment(dueDate).format('DD/MM/YYYY')}
                                        </ThemedText>
                                   </TouchableOpacity>

                                   <TouchableOpacity
                                        onPress={() => setShowTimePicker(true)}
                                        style={styles.timePickerButton}
                                   >
                                        <Ionicons name="time-outline" size={20} color="#3498db" />
                                        <ThemedText style={styles.timeText}>
                                             {moment(dueDate).format('HH:mm')}
                                        </ThemedText>
                                   </TouchableOpacity>
                              </View>

                              {showDatePicker && (
                                   <DateTimePicker
                                        testID="datePicker"
                                        value={dueDate}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        minimumDate={new Date()} // Không cho chọn ngày quá khứ
                                   />
                              )}
                              {showTimePicker && (
                                   <DateTimePicker
                                        testID="timePicker"
                                        value={dueDate}
                                        mode="time"
                                        display="default"
                                        onChange={handleTimeChange}
                                   />
                              )}

                              <ThemedText style={styles.label}>Trạng thái:</ThemedText>
                              <View style={styles.statusContainer}>
                                   <Pressable
                                        style={[
                                             styles.statusOption,
                                             status === 'pending' && {
                                                  borderColor: getStatusColor('pending'),
                                                  backgroundColor: getStatusColor('pending') + '1A',
                                             },
                                        ]}
                                        onPress={() => setStatus('pending')}
                                   >
                                        <Ionicons
                                             name="hourglass-outline"
                                             size={20}
                                             color={getStatusColor('pending')}
                                        />
                                        <ThemedText
                                             style={[
                                                  styles.statusText,
                                                  { color: getStatusColor('pending') },
                                             ]}
                                        >
                                             Đang chờ
                                        </ThemedText>
                                   </Pressable>
                                   <Pressable
                                        style={[
                                             styles.statusOption,
                                             status === 'completed' && {
                                                  borderColor: getStatusColor('completed'),
                                                  backgroundColor: getStatusColor('completed') + '1A',
                                             },
                                        ]}
                                        onPress={() => setStatus('completed')}
                                   >
                                        <Ionicons
                                             name="checkmark-circle-outline"
                                             size={20}
                                             color={getStatusColor('completed')}
                                        />
                                        <ThemedText
                                             style={[
                                                  styles.statusText,
                                                  { color: getStatusColor('completed') },
                                             ]}
                                        >
                                             Hoàn thành
                                        </ThemedText>
                                   </Pressable>
                              </View>

                              <ThemedText style={styles.label}>Ghi chú:</ThemedText>
                              <TextInput
                                   style={[styles.input, styles.notesInput]}
                                   placeholder="Ghi chú thêm về bài tập..."
                                   value={notes}
                                   onChangeText={setNotes}
                                   multiline
                                   numberOfLines={4}
                                   placeholderTextColor="#888"
                              />
                         </ScrollView>

                         <View style={styles.modalFooter}>
                              {itemToEdit && (
                                   <TouchableOpacity
                                        onPress={handleDelete}
                                        style={styles.deleteButton}
                                   >
                                        <MaterialIcons name="delete" size={24} color="#dc3545" />
                                        <ThemedText style={styles.deleteButtonText}>Xóa</ThemedText>
                                   </TouchableOpacity>
                              )}
                              <View style={styles.saveButtonContainer}>
                                   <Button
                                        title={itemToEdit ? 'Lưu thay đổi' : 'Thêm bài tập'}
                                        onPress={handleSave}
                                        color="#3498db"
                                   />
                              </View>
                         </View>

                         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                              <Ionicons name="close-circle" size={30} color="#666" />
                         </TouchableOpacity>
                    </View>
               </View>
          </Modal>
     );
};

const styles = StyleSheet.create({
     modalOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
     },
     modalContainer: {
          width: '90%',
          maxHeight: '80%', // Giới hạn chiều cao modal
          backgroundColor: '#fff',
          borderRadius: 15,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 8,
          position: 'relative', // Để position absolute cho closeButton
     },
     scrollViewContent: {
          paddingBottom: 20, // Đảm bảo có khoảng trống ở cuối ScrollView
     },
     modalTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
          color: '#333',
     },
     label: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8,
          color: '#444',
          marginTop: 15,
     },
     input: {
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
          fontSize: 16,
          color: '#333',
     },
     dateTimeContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
     },
     datePickerButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginRight: 10,
          backgroundColor: '#f9f9f9',
     },
     timePickerButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#f9f9f9',
     },
     dateText: {
          fontSize: 16,
          marginLeft: 8,
          color: '#333',
     },
     timeText: {
          fontSize: 16,
          marginLeft: 8,
          color: '#333',
     },
     statusContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 15,
          marginTop: 5,
     },
     statusOption: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#ccc',
          minWidth: 120,
          justifyContent: 'center',
     },
     statusText: {
          marginLeft: 10,
          fontSize: 16,
     },
     notesInput: {
          minHeight: 100,
          textAlignVertical: 'top',
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
     closeButton: {
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1,
     },
});

export default AddHomeworkModal;