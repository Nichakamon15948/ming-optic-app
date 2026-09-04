// ════════════════════════════════════════
// explore.tsx — หน้าเกี่ยวกับแอปและร้าน (About / How It Works)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// ไฟล์นี้แสดงข้อมูลอธิบายการทำงานของแอปพลิเคชัน (Ming Optic System Guide)
// แบ่งเนื้อหาออกเป็นส่วนหลักๆ 3 ส่วนในการทำงาน และ 1 ส่วนสำหรับข้อมูลเกี่ยวกับร้านค้า
// 
// 1. Navigation Structure: อธิบายการใช้งาน drawer menu และการเปลี่ยนหน้าด้วย Expo Router
// 2. Product Management: อธิบายการจัดการข้อมูลสินค้าผ่าน React useState
// 3. Real-time Search: อธิบายความสามารถในการค้นหาสินค้าแบบเรียลไทม์
// 4. About Section: ข้อมูลร้านค้า (สถานที่, เวลาทำการ, และชื่อผู้พัฒนา)

import { ScrollView, StyleSheet, Text, View } from 'react-native';

// ════════════════════════════════════════
// ExploreScreen — Component แสดงรายละเอียดแอปและร้านค้า
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. ใช้ ScrollView เพื่อให้หน้าจอเลื่อนดูเนื้อหาได้
// 2. สร้างกล่อง (Box) 2 กล่องหลัก
//    - กล่องแรก: สรุปฟังก์ชันการทำงานของแอป 3 หัวข้อ (Navigation, Product Management, Real-time Search)
//    - กล่องที่สอง: แสดงข้อมูลร้าน "About MING OPTIC" ประกอบด้วยตำแหน่งที่ตั้ง, เวลาทำการ และผู้พัฒนา
export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How This App Works</Text>
        <Text style={styles.subtitle}>Ming Optic System Guide</Text>

        {/* ──────────────────────────────────────── */}
        {/* ส่วนอธิบายฟังก์ชันการทำงานหลัก */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>1. Navigation Structure</Text>
          <Text style={styles.desc}>
            {'Uses drawer menu for navigation and supports multi-page routing via Expo Router.'}
          </Text>

          <Text style={styles.sectionTitle}>2. Product Management</Text>
          <Text style={styles.desc}>
            {'Displays eyewear with images, prices, and real-time stock levels using React useState.'}
          </Text>

          <Text style={styles.sectionTitle}>3. Real-time Search</Text>
          <Text style={styles.desc}>
            {'Search products in real-time using filter function as you type.'}
          </Text>
        </View>

        {/* ──────────────────────────────────────── */}
        {/* ส่วนข้อมูลร้านค้า */}
        <View style={[styles.box, { marginTop: 15, borderColor: '#C9A84C', backgroundColor: '#1E293B' }]}>
          <Text style={[styles.sectionTitle, { color: '#C9A84C' }]}>About MING OPTIC</Text>
          <Text style={styles.info}>Location: Laem Chabang, Chon Buri</Text>
          <Text style={styles.info}>Hours: Mon - Sun (9:00 AM - 8:00 PM)</Text>
          <Text style={styles.info}>Developer: Nichakamon Tapaohirun</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#F1F5F9' },
  subtitle: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginBottom: 20 },
  box: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155', width: '100%', maxWidth: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F1F5F9', marginTop: 10, marginBottom: 8 },
  desc: { fontSize: 14, color: '#94A3B8', lineHeight: 22, marginBottom: 10 },
  info: { fontSize: 14, color: '#94A3B8', marginBottom: 6, fontWeight: '500' }
});