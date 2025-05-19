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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
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
     onDelete: (id: string) => void; // Hàm xóa bài tập
}

export default function AddHomeworkModal({ visible, itemToEdit, onClose, onSave, onDelete }: AddHomeworkModalProps) {
     const [description, setDescription] = useState('');
     const [subject, setSubject] = useState('');
     const [dueDate, setDueDate] = useState(new Date());
     const [showDatePicker, setShowDatePicker] = useState(false);
     const [showTimePicker, setShowTimePicker] = useState(false);
     const [priority, setPriority] = useState<HomeworkItem['priority']>('medium');
     const [notes, setNotes] = useState('');
     const [status, setStatus] = useState<HomeworkItem['status']>('pending');

     const isEditing = itemToEdit !== null;

     // Effect để điền dữ liệu vào form khi modal mở ở chế độ sửa
     useEffect(() => {
          if (visible) {
               if (isEditing && itemToEdit) {
                    setDescription(itemToEdit.description);
                    setSubject(itemToEdit.subject);
                    setDueDate(moment(itemToEdit.dueDate).toDate());
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
                    setStatus('pending');
               }
          }
     }, [visible, itemToEdit, isEditing]);


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
               status,
          };

          if (isEditing) {
               if (itemToEdit) {
                    const updatedHomework: HomeworkItem = {
                         id: itemToEdit.id,
                         ...homeworkData,
                    };
                    onSave(updatedHomework);
               } else {
                    console.error("Lỗi (handleSave): Đang ở chế độ sửa nhưng itemToEdit là null/undefined");
                    Alert.alert("Lỗi", "Không thể lưu thay đổi. Dữ liệu không hợp lệ.");
                    return;
               }
          } else {
               onSave(homeworkData as Omit<HomeworkItem, 'id'>);
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
               "Bạn có chắc chắn muốn xóa bài tập này?",
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

     // Hàm toggle trạng thái Hoàn thành/Chưa hoàn thành
     const toggleStatus = () => {
          setStatus(prevStatus => prevStatus === 'pending' ? 'completed' : 'pending');
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
                              <ThemedText type="title">{isEditing ? 'Sửa Bài tập' : 'Thêm Bài tập mới'}</ThemedText>
                              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                   <Ionicons name="close-circle-outline" size={30} color="#555" />
                              </TouchableOpacity>
                         </View>

                         <ScrollView contentContainerStyle={styles.formScrollViewContent}>
                              <ThemedText style={styles.label}>Mô tả Bài tập:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={description}
                                   onChangeText={setDescription}
                                   placeholder="Nhập mô tả bài tập"
                                   placeholderTextColor="#999"
                              />

                              <ThemedText style={styles.label}>Môn học:</ThemedText>
                              <TextInput
                                   style={styles.input}
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholder="Nhập môn học"
                                   placeholderTextColor="#999"
                              />

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
                              {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                                   <Button title="Xong" onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }} />
                              )}


                              <ThemedText style={styles.label}>Mức độ ưu tiên:</ThemedText>
                              {/* Đã điều chỉnh style cho pickerContainer và pickerStyle */}
                              <View style={styles.pickerContainer}>
                                   <Picker
                                        selectedValue={priority}
                                        onValueChange={(itemValue, itemIndex) =>
                                             setPriority(itemValue as HomeworkItem['priority'])
                                        }
                                        style={styles.pickerStyle}
                                   // itemStyle={Platform.OS === 'ios' ? { height: 40, fontSize: 16 } : undefined} // Có thể tùy chỉnh itemStyle cho iOS
                                   >
                                        <Picker.Item label="Thấp" value="low" />
                                        <Picker.Item label="Trung bình" value="medium" />
                                        <Picker.Item label="Cao" value="high" />
                                   </Picker>
                              </View>

                              <ThemedText style={styles.label}>Ghi chú:</ThemedText>
                              <TextInput
                                   style={[styles.input, styles.notesInput]}
                                   value={notes}
                                   onChangeText={setNotes}
                                   placeholder="Ghi chú thêm (tùy chọn)"
                                   placeholderTextColor="#999"
                                   multiline={true}
                                   numberOfLines={4}
                              />

                              {isEditing && (
                                   <>
                                        <ThemedText style={styles.label}>Trạng thái:</ThemedText>
                                        <TouchableOpacity onPress={toggleStatus} style={styles.statusToggle}>
                                             <MaterialIcons
                                                  name={status === 'completed' ? 'check-circle' : 'circle'}
                                                  size={24}
                                                  color={getStatusColor(status)}
                                             />
                                             <ThemedText style={styles.statusText}>
                                                  {status === 'completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                             </ThemedText>
                                        </TouchableOpacity>
                                   </>
                              )}


                         </ScrollView>

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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
     },
     modalContent: {
          width: '90%',
          maxHeight: '90%',
          borderRadius: 10,
          padding: 20,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
     },
     modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
     },
     closeButton: {
          padding: 5,
     },
     formScrollViewContent: {
          paddingBottom: 20,
     },
     label: {
          fontSize: 16,
          marginBottom: 8,
          marginTop: 10,
          fontWeight: 'bold',
     },
     input: {
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          fontSize: 16,
          backgroundColor: '#f9f9f9',
          color: '#333',
     },
     notesInput: {
          minHeight: 100,
          textAlignVertical: 'top',
     },
     dateDisplay: {
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#f9f9f9',
          justifyContent: 'center',
     },
     pickerContainer: {
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 6,
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
          // Thêm điều chỉnh layout cho iOS Picker
          // width: '100%', // Đã xóa để thử flex
          // height: 40, // Có thể đặt chiều cao ở container thay vì picker style
     },
     pickerStyle: {
          height: 40,
          flex: 1, // Thêm flex: 1 để Picker chiếm không gian có sẵn
          // width: Platform.OS === 'ios' ? '100%' : 'auto', // Đảm bảo Picker chiếm hết chiều rộng của container trên iOS
     },
     statusToggle: {
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
     statusText: {
          marginLeft: 10,
          fontSize: 16,
     },
     modalFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
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
     },
     saveButtonContainer: {
          flex: 1,
          marginLeft: 20,
     },
     // Added styles from AddScheduleModal for consistency if needed, but not used in this modal
     timePickerButton: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9', alignItems: 'center', },
     timeText: { fontSize: 16, color: '#333', },
     timeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, },
     daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, marginTop: 5, },
     checkbox: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8, backgroundColor: '#eee', },
     checkboxSelected: { backgroundColor: '#3498db', borderColor: '#3498db', },
     checkboxText: { fontSize: 14, color: '#555', },
     checkboxTextSelected: { color: '#fff', fontWeight: 'bold', },
});