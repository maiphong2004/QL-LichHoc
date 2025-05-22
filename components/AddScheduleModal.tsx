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
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/vi';
moment.locale('vi');

import { ScheduleEvent } from '@/context/AppContext';

interface DayCheckboxProps {
     day: string;
     selected: boolean;
     onToggle: () => void;
}

const DayCheckbox = ({ day, selected, onToggle }: DayCheckboxProps) => (
     <TouchableOpacity
          style={[styles.checkbox, selected && styles.checkboxSelected]}
          onPress={onToggle}
     >
          <ThemedText
               style={[styles.checkboxText, selected && styles.checkboxTextSelected]}
          >
               {day}
          </ThemedText>
     </TouchableOpacity>
);

const daysMap: { [key: string]: ScheduleEvent['daysOfWeek'][0] } = {
     'T2': 'Mon',
     'T3': 'Tue',
     'T4': 'Wed',
     'T5': 'Thu',
     'T6': 'Fri',
     'T7': 'Sat',
     'CN': 'Sun',
};

const displayDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface AddScheduleModalProps {
     visible: boolean;
     itemToEdit: ScheduleEvent | null;
     onClose: () => void;
     onSave: (event: Omit<ScheduleEvent, 'id'> | ScheduleEvent) => void;
     onDelete: (id: string) => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
     visible,
     itemToEdit,
     onClose,
     onSave,
     onDelete,
}) => {
     const [title, setTitle] = useState('');
     const [subject, setSubject] = useState('');
     const [startTime, setStartTime] = useState(moment().toDate());
     const [endTime, setEndTime] = useState(moment().add(1, 'hour').toDate());
     const [selectedDays, setSelectedDays] = useState<ScheduleEvent['daysOfWeek']>(
          [],
     );
     const [location, setLocation] = useState('');
     const [notes, setNotes] = useState('');
     const [showStartTimePicker, setShowStartTimePicker] = useState(false);
     const [showEndTimePicker, setShowEndTimePicker] = useState(false);

     useEffect(() => {
          if (itemToEdit) {
               setTitle(itemToEdit.title);
               setSubject(itemToEdit.subject);
               setStartTime(moment(itemToEdit.startTime, 'HH:mm').toDate());
               setEndTime(moment(itemToEdit.endTime, 'HH:mm').toDate());
               setSelectedDays(itemToEdit.daysOfWeek);
               setLocation(itemToEdit.location || '');
               setNotes(itemToEdit.notes || '');
          } else {
               setTitle('');
               setSubject('');
               setStartTime(moment().toDate());
               setEndTime(moment().add(1, 'hour').toDate());
               setSelectedDays([]);
               setLocation('');
               setNotes('');
          }
     }, [itemToEdit, visible]);

     // ĐÃ SỬA: Đảm bảo pickerType (bắt buộc) đứng trước selectedDate (tùy chọn)
     const handleTimeChange = (
          event: any,
          pickerType: 'start' | 'end',
          selectedDate?: Date,
     ) => {
          if (pickerType === 'start') {
               setShowStartTimePicker(Platform.OS === 'ios');
               if (selectedDate) setStartTime(selectedDate);
          } else {
               setShowEndTimePicker(Platform.OS === 'ios');
               if (selectedDate) setEndTime(selectedDate);
          }
     };

     const handleToggleDay = (dayKey: string) => {
          const actualDay = daysMap[dayKey];
          if (selectedDays.includes(actualDay)) {
               setSelectedDays(selectedDays.filter((d) => d !== actualDay));
          } else {
               setSelectedDays([...selectedDays, actualDay]);
          }
     };

     const handleSave = () => {
          if (!title.trim() || !subject.trim() || selectedDays.length === 0) {
               Alert.alert(
                    'Lỗi',
                    'Vui lòng nhập tiêu đề, môn học và chọn ít nhất một ngày.',
               );
               return;
          }

          if (moment(startTime).isSameOrAfter(moment(endTime))) {
               Alert.alert('Lỗi', 'Thời gian kết thúc phải sau thời gian bắt đầu.');
               return;
          }

          const scheduleData: Omit<ScheduleEvent, 'id'> | ScheduleEvent = itemToEdit
               ? {
                    ...itemToEdit,
                    title,
                    subject,
                    startTime: moment(startTime).format('HH:mm'),
                    endTime: moment(endTime).format('HH:mm'),
                    daysOfWeek: selectedDays,
                    location,
                    notes,
               }
               : {
                    title,
                    subject,
                    startTime: moment(startTime).format('HH:mm'),
                    endTime: moment(endTime).format('HH:mm'),
                    daysOfWeek: selectedDays,
                    location,
                    notes,
               };
          onSave(scheduleData);
          onClose();
     };

     const handleDelete = () => {
          if (itemToEdit) {
               Alert.alert(
                    'Xác nhận xóa',
                    `Bạn có chắc chắn muốn xóa lịch học "${itemToEdit.title}"?`,
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
                                   {itemToEdit ? 'Sửa lịch học' : 'Thêm lịch học mới'}
                              </ThemedText>

                              <TextInput
                                   style={styles.input}
                                   placeholder="Tiêu đề lịch học (ví dụ: Học môn Toán)"
                                   value={title}
                                   onChangeText={setTitle}
                                   placeholderTextColor="#888"
                              />

                              <TextInput
                                   style={styles.input}
                                   placeholder="Môn học (ví dụ: Toán cao cấp)"
                                   value={subject}
                                   onChangeText={setSubject}
                                   placeholderTextColor="#888"
                              />

                              <ThemedText style={styles.label}>Thời gian:</ThemedText>
                              <View style={styles.timeContainer}>
                                   <TouchableOpacity
                                        onPress={() => setShowStartTimePicker(true)}
                                        style={styles.timePickerButton}
                                   >
                                        <Ionicons name="time-outline" size={20} color="#3498db" />
                                        <ThemedText style={styles.timeText}>
                                             Bắt đầu: {moment(startTime).format('HH:mm')}
                                        </ThemedText>
                                   </TouchableOpacity>
                                   <TouchableOpacity
                                        onPress={() => setShowEndTimePicker(true)}
                                        style={styles.timePickerButton}
                                   >
                                        <Ionicons name="time-outline" size={20} color="#3498db" />
                                        <ThemedText style={styles.timeText}>
                                             Kết thúc: {moment(endTime).format('HH:mm')}
                                        </ThemedText>
                                   </TouchableOpacity>
                              </View>

                              {showStartTimePicker && (
                                   <DateTimePicker
                                        testID="startTimePicker"
                                        value={startTime}
                                        mode="time"
                                        display="default"
                                        onChange={(event, date) =>
                                             // ĐÃ SỬA: Thay đổi thứ tự truyền tham số cho handleTimeChange
                                             handleTimeChange(event, 'start', date)
                                        }
                                   />
                              )}
                              {showEndTimePicker && (
                                   <DateTimePicker
                                        testID="endTimePicker"
                                        value={endTime}
                                        mode="time"
                                        display="default"
                                        onChange={(event, date) =>
                                             // ĐÃ SỬA: Thay đổi thứ tự truyền tham số cho handleTimeChange
                                             handleTimeChange(event, 'end', date)
                                        }
                                   />
                              )}

                              <ThemedText style={styles.label}>Các ngày trong tuần:</ThemedText>
                              <View style={styles.daysContainer}>
                                   {displayDays.map((day) => (
                                        <DayCheckbox
                                             key={day}
                                             day={day}
                                             selected={selectedDays.includes(daysMap[day])}
                                             onToggle={() => handleToggleDay(day)}
                                        />
                                   ))}
                              </View>

                              <TextInput
                                   style={styles.input}
                                   placeholder="Địa điểm (ví dụ: Phòng A101)"
                                   value={location}
                                   onChangeText={setLocation}
                                   placeholderTextColor="#888"
                              />

                              <ThemedText style={styles.label}>Ghi chú:</ThemedText>
                              <TextInput
                                   style={[styles.input, styles.notesInput]}
                                   placeholder="Ghi chú thêm về lịch học..."
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
                                        title={itemToEdit ? 'Lưu thay đổi' : 'Thêm lịch học'}
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
          maxHeight: '85%',
          backgroundColor: '#fff',
          borderRadius: 15,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 8,
          position: 'relative',
     },
     scrollViewContent: {
          paddingBottom: 20,
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
     timeContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
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
          marginRight: 10,
          backgroundColor: '#f9f9f9',
     },
     timeText: {
          fontSize: 16,
          marginLeft: 8,
          color: '#333',
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
          backgroundColor: '#f0f0f0',
     },
     checkboxSelected: {
          backgroundColor: '#3498db',
          borderColor: '#3498db',
     },
     checkboxText: {
          color: '#333',
          fontWeight: '500',
     },
     checkboxTextSelected: {
          color: '#fff',
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

export default AddScheduleModal;