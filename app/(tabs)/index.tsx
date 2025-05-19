import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// Import useAppContext nếu muốn hiển thị dữ liệu thật từ Context
// import { useAppContext } from '@/context/AppContext';

// Giả định bạn có thể lấy tên người dùng từ đâu đó (ví dụ: state, context, storage)
const userName = "Bạn"; // Thay thế bằng tên thực tế nếu có

// Dữ liệu mẫu (sẽ thay thế bằng dữ liệu từ Context sau)
// Lấy nextClass và upcomingHomework từ Context và xử lý lọc/sắp xếp để chỉ lấy các mục sắp tới
const sampleNextClass = {
  subject: 'Toán Cao cấp A1',
  time: '10:00 AM - 11:30 AM',
  location: 'Phòng A205',
  day: 'Thứ Ba', // Hoặc ngày cụ thể
};

const sampleUpcomingHomework = [
  { id: '1', description: 'Hoàn thành bài tập chương 3', subject: 'Vật lý Đại cương', dueDate: '2025-05-28T10:00:00Z' }, // Thêm timezone để moment parse đúng
  { id: '2', description: 'Làm báo cáo nhóm', subject: 'Kinh tế Vi mô', dueDate: '2025-06-01T14:00:00Z' },
  { id: '3', description: 'Ôn tập giữa kỳ', subject: 'Lịch sử Đảng', dueDate: '2025-05-25T08:00:00Z' },
  // ... thêm các bài tập khác
];

import moment from 'moment'; // Import moment để định dạng ngày
import 'moment/locale/vi';
moment.locale('vi');

export default function HomeScreen() {
  // Sử dụng useAppContext để lấy dữ liệu lịch và bài tập
  // const { schedule, homework } = useAppContext();

  // TODO: Xử lý logic để tìm buổi học tiếp theo và các bài tập sắp tới từ dữ liệu thật

  // Hiện tại dùng dữ liệu mẫu:
  const nextClass = sampleNextClass;
  const upcomingHomework = sampleUpcomingHomework;

  // Hàm helper định dạng ngày cho bài tập sắp tới (có thể tái sử dụng từ HomeworkScreen)
  const formatHomeworkDueDate = (dateString: string) => {
    const date = moment(dateString);
    if (date.isSame(moment(), 'day')) {
      return 'Hôm nay, ' + date.format('HH:mm');
    } else if (date.isSame(moment().add(1, 'day'), 'day')) {
      return 'Ngày mai, ' + date.format('HH:mm');
    } else {
      return date.format('HH:mm, DD/MM/YYYY');
    }
  };


  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Lời chào */}
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.headerTitle}>
            Chào, {userName}!
          </ThemedText>
          <ThemedText type="subtitle" style={styles.headerSubtitle}>
            Tổng quan học tập của bạn
          </ThemedText>
        </View>

        {/* Khu vực Lịch học sắp tới */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Buổi học tiếp theo
          </ThemedText>
          {nextClass ? (
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold">{nextClass.subject}</ThemedText>
              <ThemedText style={styles.cardText}>
                ⏰ {nextClass.time} ({nextClass.day})
              </ThemedText>
              <ThemedText style={styles.cardText}>
                📍 {nextClass.location}
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={styles.emptyCardText}>
              Không có buổi học nào sắp tới.
            </ThemedText>
          )}
        </ThemedView>

        {/* Khu vực Bài tập sắp tới */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Bài tập sắp tới ({upcomingHomework.length})
          </ThemedText>
          {upcomingHomework.length > 0 ? (
            <ThemedView style={styles.homeworkListContainer}>
              {upcomingHomework.map(item => (
                <ThemedView key={item.id} style={styles.homeworkItem}>
                  <ThemedText type="defaultSemiBold" style={styles.homeworkItemTitle}>
                    {item.description}
                  </ThemedText>
                  <ThemedText style={styles.homeworkItemText}>
                    Môn: {item.subject}
                  </ThemedText>
                  <View style={styles.homeworkItemTextRow}>
                    <ThemedText style={styles.homeworkItemText}>Hạn chót: </ThemedText>
                    <ThemedText style={styles.homeworkItemDueDate}>{formatHomeworkDueDate(item.dueDate)}</ThemedText>
                  </View>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <>
              <ThemedText style={styles.emptyCardText}>
                Không có bài tập nào sắp tới.
              </ThemedText>
              <ThemedText style={styles.emptyCardText}>
                Nhấn nút "+" ở góc trên để thêm mới!
              </ThemedText>
            </>
          )}
        </ThemedView>

        {/* Bạn có thể thêm các khu vực khác như thông báo, thống kê, v.v. */}

      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#555',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  emptyCardText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 20,
  },
  homeworkListContainer: {
    marginTop: 0,
  },
  homeworkItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  homeworkItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  homeworkItemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  homeworkItemDueDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  homeworkItemTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});