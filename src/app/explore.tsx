import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚙️</Text>
        <Text style={styles.title}>How This App Works</Text>
        <Text style={styles.subtitle}>คู่มือการทำงานของระบบ MING OPTIC</Text>

        {/* กล่องอธิบายการทำงานของแอป */}
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>🛠️ 1. Navigation Structure (ระบบนำทาง)</Text>
          <Text style={styles.desc}>
            • <Text style={{fontWeight: 'bold'}}>Top Drawer Menu (☰):</Text> ใช้ระบบเมนูลิ้นชักมุมซ้ายบนในการนำทาง เพื่อประหยัดพื้นที่หน้าจอและให้ความรู้สึกเป็น Mobile Native App{"\n"}
            • <Text style={{fontWeight: 'bold'}}>Multi-page Support:</Text> รองรับการสลับหน้าจออย่างลื่นไหลผ่านระบบ Expo Router
          </Text>

          <Text style={styles.sectionTitle}>📦 2. Product Management (ระบบสินค้า)</Text>
          <Text style={styles.desc}>
            • แสดงรายการแว่นตาพร้อมรูปภาพ ราคา และจำนวนสต็อกสินค้าจริง (Real-time Stock Display){"\n"}
            • ใช้ <Text style={{fontWeight: 'bold'}}>React useState</Text> ในการจัดการสถานะข้อมูลคลังสินค้า 3 ชิ้นตามสั่ง
          </Text>

          <Text style={styles.sectionTitle}>🔍 3. Real-time Search (ระบบค้นหา)</Text>
          <Text style={styles.desc}>
            • ฟังก์ชันค้นหาสินค้าทำงานแบบ Real-time โดยใช้คำสั่ง <Text style={{fontWeight: 'bold'}}>.filter()</Text> กรองชื่อแว่นตาทันทีที่ผู้ใช้พิมพ์ข้อความลงไป
          </Text>
        </View>

        {/* กล่องข้อมูลร้านและผู้พัฒนา (แก้เป็นชื่อ ณิชกมล เรียบร้อย!) */}
        <View style={[styles.box, { marginTop: 15, borderColor: '#B5838D', backgroundColor: '#FFF9F9' }]}>
          <Text style={[styles.sectionTitle, { color: '#B5838D' }]}>📍 About MING OPTIC</Text>
          <Text style={styles.info}>• Location: Laem Chabang, Chon Buri</Text>
          <Text style={styles.info}>• Hours: Mon - Sun (9:00 AM - 8:00 PM)</Text>
          <Text style={styles.info}>• Developer: Nichakamon Tapaohirun</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F6' },
  content: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  icon: { fontSize: 50, marginBottom: 5 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', fontStyle: 'italic', marginBottom: 20 },
  box: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 3, borderWidth: 1, borderColor: '#E9ECEF', width: '100%', maxWidth: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212529', marginTop: 10, marginBottom: 8 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 10 },
  info: { fontSize: 14, color: '#4A4A4A', marginBottom: 6, fontWeight: '500' }
});