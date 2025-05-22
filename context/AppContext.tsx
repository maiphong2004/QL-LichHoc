// context/AppContext.tsx
import React, {
     createContext,
     useState,
     useContext,
     useEffect,
     useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import moment from 'moment'; // Đảm bảo đã cài đặt moment
import 'moment/locale/vi'; // Import tiếng Việt
moment.locale('vi');

// Đặt trình xử lý thông báo để hiển thị thông báo khi ứng dụng đang chạy ở foreground
Notifications.setNotificationHandler({
     handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true, // THÊM DÒNG NÀY
          shouldShowList: true,   // THÊM DÒNG NÀY
     }),
});

export interface HomeworkItem {
     id: string;
     description: string;
     subject: string;
     dueDate: string; // ISO string for date and time (e.g., "2025-05-28T10:00:00Z")
     status: 'pending' | 'completed';
     notes?: string;
     notificationId?: string; // Thêm trường này để lưu ID thông báo
}

export interface ScheduleEvent {
     id: string;
     title: string;
     subject: string;
     startTime: string; // HH:mm
     endTime: string; // HH:mm
     daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
     location?: string;
     notes?: string;
}

interface AppContextType {
     homeworks: HomeworkItem[];
     schedules: ScheduleEvent[];
     addHomework: (homework: Omit<HomeworkItem, 'id'>) => Promise<void>;
     updateHomework: (homework: HomeworkItem) => Promise<void>;
     deleteHomework: (id: string) => Promise<void>;
     addSchedule: (event: Omit<ScheduleEvent, 'id'>) => Promise<void>;
     updateSchedule: (event: ScheduleEvent) => Promise<void>;
     deleteSchedule: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
     children,
}) => {
     const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
     const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);

     // Hàm yêu cầu quyền thông báo
     const requestNotificationPermissions = useCallback(async () => {
          const { status: existingStatus } =
               await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
               const { status } = await Notifications.requestPermissionsAsync();
               finalStatus = status;
          }
          if (finalStatus !== 'granted') {
               console.log('Failed to get push token for push notification!');
               return false;
          }
          // Cài đặt kênh thông báo cho Android (quan trọng cho Android 8.0 trở lên)
          if (Platform.OS === 'android') {
               await Notifications.setNotificationChannelAsync('homework_reminders', {
                    name: 'Nhắc nhở bài tập',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default', // Có thể tùy chỉnh âm thanh thông báo
               });
          }
          return true;
     }, []);

     useEffect(() => {
          requestNotificationPermissions();
          const loadData = async () => {
               try {
                    const storedHomeworks = await AsyncStorage.getItem('homeworks');
                    const storedSchedules = await AsyncStorage.getItem('schedules');
                    if (storedHomeworks) {
                         setHomeworks(JSON.parse(storedHomeworks));
                    }
                    if (storedSchedules) {
                         setSchedules(JSON.parse(storedSchedules));
                    }
               } catch (error) {
                    console.error('Failed to load data from AsyncStorage', error);
               }
          };
          loadData();
     }, [requestNotificationPermissions]); // Thêm requestNotificationPermissions vào dependency array

     useEffect(() => {
          const saveData = async () => {
               try {
                    await AsyncStorage.setItem('homeworks', JSON.stringify(homeworks));
                    await AsyncStorage.setItem('schedules', JSON.stringify(schedules));
               } catch (error) {
                    console.error('Failed to save data to AsyncStorage', error);
               }
          };
          saveData();
     }, [homeworks, schedules]);

     // Hàm lập lịch thông báo
     const scheduleHomeworkNotification = async (
          homework: HomeworkItem,
     ): Promise<string | undefined> => {
          const hasPermission = await requestNotificationPermissions();
          if (!hasPermission) {
               console.log('Không có quyền gửi thông báo.');
               return;
          }

          const dueDateMoment = moment(homework.dueDate);
          const notificationTime = moment(dueDateMoment).subtract(5, 'minutes');

          // Không lập lịch nếu thời gian thông báo đã qua
          if (notificationTime.isBefore(moment())) {
               console.log('Thời gian thông báo đã qua, không thể lập lịch.');
               return;
          }

          try {
               const id = await Notifications.scheduleNotificationAsync({
                    content: {
                         title: 'Sắp hết hạn bài tập! 📚',
                         body: `${homework.description} môn ${homework.subject} sẽ hết hạn sau 5 phút.`,
                         data: { type: 'homework', homeworkId: homework.id }, // Dữ liệu bổ sung
                    },
                    trigger: {
                         date: notificationTime.toDate(),
                         channelId: 'homework_reminders', // Sử dụng kênh đã định nghĩa cho Android
                    },
               });
               console.log(
                    `Thông báo bài tập "${homework.description}" (ID: ${homework.id}) đã được lập lịch với Notification ID: ${id}`,
               );
               return id;
          } catch (error) {
               console.error('Lỗi khi lập lịch thông báo:', error);
               return undefined;
          }
     };

     // Hàm hủy thông báo
     const cancelHomeworkNotification = async (notificationId?: string) => {
          if (notificationId) {
               try {
                    await Notifications.cancelScheduledNotificationAsync(notificationId);
                    console.log(`Thông báo với Notification ID ${notificationId} đã bị hủy.`);
               } catch (error) {
                    console.error('Lỗi khi hủy thông báo:', error);
               }
          }
     };

     const addHomework = async (newHomework: Omit<HomeworkItem, 'id'>) => {
          const id = Date.now().toString(); // Tạo ID duy nhất
          const homeworkWithId: HomeworkItem = {
               ...newHomework,
               id,
               status: 'pending',
          };

          // Lập lịch thông báo và lưu notificationId
          const notificationId = await scheduleHomeworkNotification(homeworkWithId);
          if (notificationId) {
               homeworkWithId.notificationId = notificationId;
          }

          setHomeworks((prev) => [...prev, homeworkWithId]);
     };

     const updateHomework = async (updatedHomework: HomeworkItem) => {
          // 1. Hủy thông báo cũ nếu có
          if (updatedHomework.notificationId) {
               await cancelHomeworkNotification(updatedHomework.notificationId);
          }

          // 2. Lập lịch thông báo mới nếu bài tập chưa hoàn thành VÀ hạn chót còn trong tương lai (ít nhất 5 phút)
          let newNotificationId: string | undefined = undefined;
          if (
               updatedHomework.status !== 'completed' && // Chỉ thông báo nếu chưa hoàn thành
               moment(updatedHomework.dueDate).isAfter(moment().add(5, 'minutes')) // Và còn ít nhất 5 phút
          ) {
               newNotificationId = await scheduleHomeworkNotification(updatedHomework);
          }

          // Cập nhật trạng thái bài tập với notificationId mới (hoặc undefined nếu đã hủy)
          setHomeworks((prev) =>
               prev.map((hw) =>
                    hw.id === updatedHomework.id
                         ? { ...updatedHomework, notificationId: newNotificationId }
                         : hw,
               ),
          );
     };

     const deleteHomework = async (id: string) => {
          const homeworkToDelete = homeworks.find((hw) => hw.id === id);
          if (homeworkToDelete && homeworkToDelete.notificationId) {
               await cancelHomeworkNotification(homeworkToDelete.notificationId); // Hủy thông báo liên quan
          }
          setHomeworks((prev) => prev.filter((hw) => hw.id !== id));
     };

     const addSchedule = async (newEvent: Omit<ScheduleEvent, 'id'>) => {
          const id = Date.now().toString();
          setSchedules((prev) => [...prev, { ...newEvent, id }]);
     };

     const updateSchedule = async (updatedEvent: ScheduleEvent) => {
          setSchedules((prev) =>
               prev.map((event) =>
                    event.id === updatedEvent.id ? updatedEvent : event,
               ),
          );
     };

     const deleteSchedule = async (id: string) => {
          setSchedules((prev) => prev.filter((event) => event.id !== id));
     };

     return (
          <AppContext.Provider
               value={{
                    homeworks,
                    schedules,
                    addHomework,
                    updateHomework,
                    deleteHomework,
                    addSchedule,
                    updateSchedule,
                    deleteSchedule,
               }}
          >
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