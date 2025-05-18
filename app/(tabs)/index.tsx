import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// TODO: Import useAppContext nếu muốn hiển thị dữ liệu thật từ Context
// import { useAppContext } from '@/context/AppContext';

// Giả định bạn có thể lấy tên người dùng từ đâu đó (ví dụ: state, context, storage)
const userName = "Bạn"; // Thay thế bằng tên thực tế nếu có

// Dữ liệu mẫu (sẽ thay thế bằng dữ liệu từ Context sau)
// TODO: Lấy nextClass và upcomingHomework từ Context và xử lý lọc/sắp xếp để chỉ lấy các mục sắp tới
const sampleNextClass = {
  subject: 'Toán Cao cấp A1',
  time: '10:00 AM - 11:30 AM',
  location: 'Phòng A205',
  day: 'Thứ Ba', // Hoặc ngày cụ thể
};

const sampleUpcomingHomework = [
  { id: '1', description: 'Hoàn thành bài tập chương 3', subject: 'Vật lý Đại cương', dueDate: '2025-05-28' },
  { id: '2', description: 'Làm báo cáo nhóm', subject: 'Kinh tế Vi mô', dueDate: '2025-06-01' },
  { id: '3', description: 'Ôn tập giữa kỳ', subject: 'Lịch sử Đảng', dueDate: '2025-05-25' },
  // ... thêm các bài tập khác
];


export default function HomeScreen() {
  // TODO: Sử dụng useAppContext để lấy dữ liệu lịch và bài tập
  // const { schedule, homework } = useAppContext();

  // TODO: Xử lý logic để tìm buổi học tiếp theo và các bài tập sắp tới từ dữ liệu thật

  // Hiện tại dùng dữ liệu mẫu:
  const nextClass = sampleNextClass;
  const upcomingHomework = sampleUpcomingHomework;


  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Lời chào */}
        <View style={styles.headerContainer}>
          {/* Văn bản đã được bọc đúng trong ThemedText */}
          <ThemedText type="title" style={styles.headerTitle}>
            Chào, {userName}!
          </ThemedText>
          {/* Văn bản đã được bọc đúng trong ThemedText */}
          <ThemedText type="subtitle" style={styles.headerSubtitle}>
            Tổng quan học tập của bạn
          </ThemedText>
        </View>

        {/* Khu vực Lịch học sắp tới */}
        <ThemedView style={styles.sectionContainer}>
          {/* Tiêu đề phần đã được bọc đúng trong ThemedText */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Buổi học tiếp theo
          </ThemedText>
          {nextClass ? (
            // Card hiển thị thông tin buổi học nếu có
            <ThemedView style={styles.card}>
              {/* Văn bản đã được bọc đúng */}
              <ThemedText type="defaultSemiBold">{nextClass.subject}</ThemedText>
              {/* Kết hợp icon emoji và text trong ThemedText */}
              <ThemedText style={styles.cardText}>
                ⏰ {nextClass.time} ({nextClass.day})
              </ThemedText>
              {/* Kết hợp icon emoji và text trong ThemedText */}
              <ThemedText style={styles.cardText}>
                📍 {nextClass.location}
              </ThemedText>
            </ThemedView>
          ) : (
            // Hiển thị thông báo nếu không có buổi học sắp tới
            <ThemedText style={styles.emptyCardText}>
              Không có buổi học nào sắp tới.
            </ThemedText>
          )}
        </ThemedView>

        {/* Khu vực Bài tập sắp tới */}
        <ThemedView style={styles.sectionContainer}>
          {/* Tiêu đề phần đã được bọc đúng trong ThemedText */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Bài tập sắp tới ({upcomingHomework.length})
          </ThemedText>
          {upcomingHomework.length > 0 ? (
            // Danh sách bài tập nếu có
            <ThemedView style={styles.homeworkListContainer}>
              {upcomingHomework.map(item => (
                // Mỗi item bài tập là một ThemedView
                <ThemedView key={item.id} style={styles.homeworkItem}>
                  {/* Văn bản trong item đã được bọc đúng */}
                  <ThemedText type="defaultSemiBold" style={styles.homeworkItemTitle}>
                    {item.description}
                  </ThemedText>
                  <ThemedText style={styles.homeworkItemText}>
                    Môn: {item.subject}
                  </ThemedText>
                  {/* DÒNG NÀY ĐƯỢC CHỈNH SỬA */}
                  <View style={styles.homeworkItemTextRow}>
                    <ThemedText style={styles.homeworkItemText}>Hạn chót: </ThemedText>
                    <ThemedText style={styles.homeworkItemDueDate}>{item.dueDate}</ThemedText>
                  </View>

                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            // Hiển thị thông báo nếu không có bài tập sắp tới
            <> {/* Sử dụng Fragment khi có nhiều hơn 1 component ngang cấp */}
              <ThemedText style={styles.emptyCardText}>
                Không có bài tập nào sắp tới.
              </ThemedText>
              {/* Chỉ hiển thị gợi ý thêm khi thực sự không có bài tập nào */}
              <ThemedText style={styles.emptyCardText}>
                Nhấn nút "+" ở góc trên để thêm mới!
              </ThemedText>
            </>
          )}
        </ThemedView>

        {/* Bạn có thể thêm các khu vực khác như thông báo, thống kê, v.v. */}

      </ScrollView> {/* Đóng ScrollView */}
    </ThemedView>
  )
} // Kết thúc component HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Màu nền sẽ do ThemedView quyết định
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100, // Khoảng trống dưới cùng cho thanh tab
  },
  headerContainer: {
    marginBottom: 20,
    // Màu nền do ThemedView của container quyết định
  },
  headerTitle: {
    fontSize: 28, // Kích thước lớn hơn cho tiêu đề chính
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18, // Kích thước nhỏ hơn cho phụ đề
    color: '#555', // Màu chữ xám hơn
  },
  sectionContainer: {
    marginBottom: 20,
    // Màu nền do ThemedView của container quyết định
  },
  sectionTitle: {
    fontSize: 20, // Kích thước tiêu đề phần
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  card: { // Style cho card lịch học
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10, // Bo góc nhiều hơn
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6, // Đổ bóng mềm hơn
    elevation: 4,
  },
  cardText: { // Style chung cho text trong card
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
    // Các style flexDirection/flexWrap đã bị xóa như trong comment của bạn
  },
  emptyCardText: { // Style cho text khi không có item nào
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 20,
  },
  homeworkListContainer: {
    marginTop: 0, // Đã có khoảng cách từ sectionTitle
  },
  homeworkItem: { // Style cho mỗi item bài tập
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10, // Bo góc nhiều hơn
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
    // Các style flexDirection/flexWrap đã bị xóa như trong comment của bạn
  },
  homeworkItemDueDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c', // Màu đỏ cho hạn chót
  },
  homeworkItemTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});