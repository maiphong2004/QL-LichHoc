import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Notifications from 'expo-notifications'; // Bỏ import Notifications
import moment from 'moment'; // Vẫn cần moment cho dueDate
import 'moment/locale/vi';
moment.locale('vi');
import { ActivityIndicator, StyleSheet, View, LayoutAnimation, UIManager, Platform } from 'react-native';

import { Text } from 'react-native';

// Cần thiết cho LayoutAnimation hoạt động trên Android
// Phần này có thể giữ hoặc bỏ tùy nhu cầu animation, không liên quan notification
// if (Platform.OS === 'android') {
//      if (UIManager.setLayoutAnimationEnabledExperimental) {
//           UIManager.setLayoutAnimationEnabledExperimental(true);
//      }
// }

// ... (các imports và khai báo KEYs, interfaces ScheduleEvent, HomeworkItem giữ nguyên) ...
const SCHEDULE_STORAGE_KEY = '@MyApp:schedule';
const HOMEWORK_STORAGE_KEY = '@MyApp:homework';
const REMINDER_OFFSET_STORAGE_KEY = '@MyApp:reminderOffset'; // Vẫn giữ key để không mất dữ liệu nếu có

export interface ScheduleEvent {
     id: string;
     subject: string;
     startTime: string; // Lưu chỉ giờ phút dạng string 'HH:mm'
     endTime: string; // Lưu chỉ giờ phút dạng string 'HH:mm'
     daysOfWeek: string[]; // Mảng các ngày diễn ra (ví dụ: ['Mon', 'Wed'])
     location: string;
     // Có thể thêm các thuộc tính khác sau này
}

export interface HomeworkItem {
     id: string;
     description: string;
     subject: string;
     dueDate: string; // Lưu dạng ISO string
     status: 'pending' | 'completed';
     priority: 'low' | 'medium' | 'high';
     notes: string;
     // Có thể thêm các thuộc tính khác sau này
}

interface AppContextState {
     schedule: ScheduleEvent[];
     homework: HomeworkItem[];
     addSchedule: (event: Omit<ScheduleEvent, 'id'>) => void;
     addHomework: (item: Omit<HomeworkItem, 'id'>) => void;
     updateSchedule: (event: ScheduleEvent) => void;
     deleteSchedule: (id: string) => void;
     updateHomework: (item: HomeworkItem) => void;
     deleteHomework: (id: string) => void;
     // reminderOffsetMinutes: number; // Bỏ state này
     // setReminderOffsetMinutes: (minutes: number) => void; // Bỏ hàm này
}


const AppContext = createContext<AppContextState | undefined>(undefined);

interface AppProviderProps {
     children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
     const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
     const [homework, setHomework] = useState<HomeworkItem[]>([]);
     // const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(15); // Bỏ state này
     const [isLoading, setIsLoading] = useState(true);


     // --- Hàm Lên lịch Thông báo cho Bài tập (Bỏ logic) ---
     const scheduleHomeworkNotification = async (item: HomeworkItem) => {
          // Logic lên lịch đã được bỏ
          console.log(`Notification scheduling logic for homework item ${item.id} is skipped.`);
     };
     // --- Hàm Hủy Thông báo cho Bài tập (Bỏ logic) ---
     const cancelHomeworkNotification = async (itemId: string) => {
          // Logic hủy thông báo đã được bỏ
          console.log(`Notification cancellation logic for homework item ${itemId} is skipped.`);
     };
     // --- Hàm Lên lịch Thông báo cho Lịch học (Bỏ logic) ---
     const scheduleScheduleNotifications = async (event: ScheduleEvent) => {
          // Logic lên lịch đã được bỏ
          console.log(`Notification scheduling logic for schedule event ${event.id} is skipped.`);
     };
     // --- Hàm Hủy Thông báo cho Lịch học (Bỏ logic) ---
     const cancelScheduleNotifications = async (eventId: string) => {
          // Logic hủy thông báo đã được bỏ
          console.log(`Notification cancellation logic for schedule event ${eventId} is skipped.`);
     };


     // --- Effect để Tải/Lưu dữ liệu và cài đặt (Giữ nguyên logic tải dữ liệu) ---
     useEffect(() => {
          const loadDataAndSettings = async () => {
               try {
                    const storedSchedule = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
                    const storedHomework = await AsyncStorage.getItem(HOMEWORK_STORAGE_KEY);
                    // const storedOffset = await AsyncStorage.getItem(REMINDER_OFFSET_STORAGE_KEY); // Bỏ tải offset nếu không dùng

                    if (storedSchedule !== null) setSchedule(JSON.parse(storedSchedule));
                    if (storedHomework !== null) setHomework(JSON.parse(storedHomework));
                    // if (storedOffset !== null) setReminderOffsetMinutes(parseInt(storedOffset, 10)); // Bỏ set offset nếu không dùng

               } catch (error) {
                    console.error("Failed to load data from AsyncStorage", error);
               } finally {
                    setIsLoading(false);
               }
          };
          loadDataAndSettings();
     }, []);


     useEffect(() => {
          if (isLoading) return;
          const saveData = async () => {
               try {
                    await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
                    console.log("Schedule data saved!");
               } catch (error) {
                    console.error("Failed to save schedule data", error);
               }
          };
          saveData();
     }, [schedule, isLoading]);


     useEffect(() => {
          if (isLoading) return;
          const saveData = async () => {
               try {
                    await AsyncStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(homework));
                    console.log("Homework data saved!");
               } catch (error) {
                    console.error("Failed to save homework data", error);
               }
          };
          saveData();
     }, [homework, isLoading]);

     // Bỏ effect lưu reminderOffsetMinutes nếu không dùng
     // useEffect(() => {
     //       if (isLoading) return;
     //       const saveReminderOffset = async () => {
     //            try {
     //                 await AsyncStorage.setItem(REMINDER_OFFSET_STORAGE_KEY, reminderOffsetMinutes.toString());
     //                 console.log("Reminder offset saved!");
     //            } catch (error) {
     //                 console.error("Failed to save reminder offset", error);
     //            }
     //       };
     //       saveReminderOffset();
     // }, [reminderOffsetMinutes, isLoading]);


     // --- Effect để Lên lịch lại tất cả thông báo (Bỏ logic) ---
     useEffect(() => {
          if (!isLoading) {
               console.log("Notification rescheduling logic is skipped.");
               // Logic lên lịch/hủy đã bỏ
          }
     }, [isLoading, homework, schedule]); // Bỏ reminderOffsetMinutes khỏi dependencies


     // --- Hàm Thêm/Cập nhật/Xóa dữ liệu (Sửa để bỏ gọi hàm notification) ---
     const addSchedule = (event: Omit<ScheduleEvent, 'id'>) => {
          const newEvent: ScheduleEvent = { id: Date.now().toString(), ...event };
          setSchedule(prevSchedule => [...prevSchedule, newEvent]);
          // scheduleScheduleNotifications(newEvent); // Bỏ gọi hàm lên lịch
     };

     const addHomework = (item: Omit<HomeworkItem, 'id'>) => {
          const newItem: HomeworkItem = { id: Date.now().toString(), ...item };
          setHomework(prevHomework => [...prevHomework, newItem]);
          // scheduleHomeworkNotification(newItem); // Bỏ gọi hàm lên lịch
     };

     const updateSchedule = (event: ScheduleEvent) => {
          setSchedule(prevSchedule => prevSchedule.map(item => item.id === event.id ? event : item));
          // cancelScheduleNotifications(event.id); // Bỏ gọi hàm hủy
          // scheduleScheduleNotifications(event); // Bỏ gọi hàm lên lịch
     };

     const deleteSchedule = (id: string) => {
          setSchedule(prevSchedule => prevSchedule.filter(item => item.id !== id));
          // cancelScheduleNotifications(id); // Bỏ gọi hàm hủy
     };

     const updateHomework = (item: HomeworkItem) => {
          setHomework(prevHomework => prevHomework.map(hw => hw.id === item.id ? item : hw));
          // scheduleHomeworkNotification(item); // Bỏ gọi hàm lên lịch
     };

     const deleteHomework = (id: string) => {
          setHomework(prevHomework => prevHomework.filter(hw => hw.id !== id));
          // cancelHomeworkNotification(id); // Bỏ gọi hàm hủy
     };



     const contextValue: AppContextState = {
          schedule,
          homework,
          addSchedule,
          addHomework,
          updateSchedule,
          deleteSchedule,
          updateHomework,
          deleteHomework,
          // reminderOffsetMinutes, // Bỏ khỏi context
          // setReminderOffsetMinutes, // Bỏ khỏi context
     };

     if (isLoading) {
          return (
               <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3498db" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
               </View>
          );
     }

     return (
          <AppContext.Provider value={contextValue}>
               {children}
          </AppContext.Provider>
     );
};

export const useAppContext = () => {
     const context = useContext(AppContext);
     if (context === undefined) {
          throw new Error('useAppContext must be used within an AppProvider');
     }
     return context;
};

const styles = StyleSheet.create({
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f4f7f6',
     },
     loadingText: {
          marginTop: 10,
          fontSize: 16,
          color: '#555',
     }
});