// ============================================================
// edit.tsx - หน้าแก้ไขสินค้า (Edit Product)
// ============================================================

// 1. นำเข้าเครื่องมือที่จำเป็น (Imports)
import { useLocalSearchParams, useRouter } from 'expo-router'; // จัดการเรื่องการเปลี่ยนหน้าจอและการดึงพารามิเตอร์จาก URL
import { useEffect, useState } from 'react'; // จัดการ State (ข้อมูลหน้าจอ) และ Lifecycle (วงจรการทำงาน)
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'; // ตัววาด UI
import { API_BASE_URL } from '../constants/api'; // นำเข้าลิงก์ API หลักของโปรเจกต์

// 2. กำหนดชุดสี (Color Palette) 
// เก็บใส่ตัวแปร C เพื่อให้เรียกใช้ง่ายและแก้ไขสีทั้งหน้าได้จากจุดเดียว
const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', text: '#F1F5F9',
  textMuted: '#94A3B8', red: '#EF4444', green: '#10B981',
};

export default function EditProductScreen() {
  // สร้างตัวแปร router สำหรับสั่งเปลี่ยนหน้า
  const router = useRouter();
  // สร้างตัวแปร params สำหรับรับข้อมูลสินค้าที่ส่งพ่วงมากับ URL จากหน้าหลัก
  const params = useLocalSearchParams();

  // 3. สร้าง State เพื่อเก็บข้อมูลแต่ละช่องในฟอร์ม
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [productId, setProductId] = useState(null); // เก็บ ID ของสินค้าที่กำลังแก้
  
  // State สำหรับจัดการสถานะของหน้าจอ
  const [isSubmitting, setIsSubmitting] = useState(false); // เช็กว่ากำลังกดเซฟอยู่ไหม (ป้องกันการกดรัว)
  const [errorMsg, setErrorMsg] = useState(''); // ข้อความแจ้งเตือนสีแดง
  const [successMsg, setSuccessMsg] = useState(''); // ข้อความสำเร็จสีเขียว

  // 4. useEffect: ดึงข้อมูลสินค้าเดิมมาแสดงในช่องกรอก
  // จะทำงานทันทีเมื่อได้รับ params.product
  useEffect(() => {
    if (params.product) {
      try {
        // ถอดรหัสข้อความ String จาก URL กลับมาเป็นก้อน Object
        const item = JSON.parse(decodeURIComponent(params.product as string));
        
        // เอาข้อมูลเดิมมาตั้งค่าให้ State แต่ละตัว
        setProductId(item.id);
        setName(item.name || '');
        // กรองราคาให้ชัวร์ว่ามีแค่ตัวเลข ก่อนนำไปแสดงผล
        const rawPrice = String(item.price || '').replace(/[^0-9.]/g, '');
        setPrice(rawPrice);
        setStock(String(item.stock ?? ''));
        setImage(item.image || item.image_url || '');
      } catch (e) { console.error(e); }
    }
  }, [params.product]);

  // 5. Data Validation ฝั่ง Frontend: กรองช่องราคา
  // เมื่อแอดมินพิมพ์ ระบบจะอนุญาตให้กรอกได้แค่ "ตัวเลขและจุดทศนิยม" เท่านั้น
  const handlePriceChange = (text: string) => {
    const num = text.replace(/[^0-9.]/g, ''); // Regex กรองตัวอักษรทิ้ง
    setPrice(num);
    setErrorMsg(''); // พิมพ์ปุ๊บ ให้ลบข้อความ Error ทิ้ง
  };

  // 6. ฟังก์ชันหลัก: การบันทึกข้อมูล (Save)
  const handleSaveEdit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // สเต็ปที่ 1: เช็กว่ากรอกข้อมูลครบทุกช่องไหม ถ้าไม่ครบให้เตือน
    // ใช้ stock === '' แทน !stock เพื่อให้ค่า "0" (สินค้าหมดสต็อก) ผ่าน validation ได้
    if (!name || !price || stock === '' || !image) {
      setErrorMsg('Please fill in all fields');
      return; // หยุดการทำงาน
    }

    setIsSubmitting(true); // ล็อคปุ่ม ป้องกันผู้ใช้กดซ้ำระหว่างรอเซิร์ฟเวอร์
    try {
      // คลีนตัวเลขอีกรอบให้ชัวร์ก่อนส่งไป Database
      const cleanPrice = price.replace(/[^0-9.]/g, ''); 
      const cleanStock = stock.replace(/[^0-9]/g, '');

      // สเต็ปที่ 2: ดึง JWT Token (กุญแจยืนยันสิทธิ์แอดมิน) ออกมาจากระบบ
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

      // สเต็ปที่ 3: ส่งข้อมูลไปที่ Backend API เพื่อแก้ไขข้อมูล (ใช้ Method PUT)
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // แนบ Token ไปด้วยเพื่อความปลอดภัย
        },
        body: JSON.stringify({ name, stock: cleanStock, price: cleanPrice, image }) // แปลงข้อมูลฟอร์มเป็น JSON
      });
      const data = await response.json(); // รอรับคำตอบจากเซิร์ฟเวอร์

      // สเต็ปที่ 4: จัดการคำตอบจากเซิร์ฟเวอร์
      if (response.ok && data.success) {
        // ถ้าสำเร็จ: โชว์ข้อความสีเขียว แล้วหน่วงเวลา 0.8 วิ ก่อนเด้งกลับหน้าแรก
        setSuccessMsg('Product updated successfully!');
        setTimeout(() => {
          // เด้งกลับและส่งพารามิเตอร์ refresh เพื่อบังคับให้หน้าแรกดึงข้อมูลใหม่
          router.replace(`/?admin=true&refresh=${Date.now()}`);
        }, 800);
      } else {
        // ถ้า API ฟ้อง Error ให้เอาข้อความนั้นมาโชว์แอดมิน
        setErrorMsg(data.error || data.message || 'Failed to update product');
      }
    } catch (e) {
      // ถ้าเน็ตหลุด หรือติดต่อเซิร์ฟเวอร์ไม่ได้
      console.error('Edit save error:', e, 'URL:', `${API_BASE_URL}/products/${productId}`);
      setErrorMsg('Cannot connect to server: ' + (e.message || String(e)));
    } finally { 
      setIsSubmitting(false); // ปลดล็อคปุ่ม
    }
  };

  // ============================================================
  // 7. ส่วนการวาดหน้าจอ (UI Component)
  // ============================================================
  return (
    <SafeAreaView style={styles.container}>
      {/* แถบด้านบนสุด (Top Bar) */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/?admin=true')}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>

      {/* ใช้ ScrollView เพื่อให้ฟอร์มสามารถไถขึ้นลงได้ */}
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formWrapper}>
          
          {/* ส่วนหัวของฟอร์ม */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Edit Eyewear</Text>
            <Text style={styles.formSub}>Update the product details below</Text>
            {/* Conditional Rendering: ถ้ามี ID สินค้า ถึงจะโชว์ป้ายกำกับ ID */}
            {productId && (
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>{'Editing ID: ' + productId}</Text>
              </View>
            )}
          </View>

          {/* กล่องแจ้งเตือน Error สีแดง (โชว์เมื่อตัวแปร errorMsg ไม่ว่างเปล่า) */}
          {errorMsg !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* กล่องสำเร็จ สีเขียว (โชว์เมื่อเซฟเสร็จ) */}
          {successMsg !== '' && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* ช่องกรอก ชื่อสินค้า */}
          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(t) => { setName(t); setErrorMsg(''); }} // พิมพ์ปุ๊บอัปเดต State ปั๊บ
            placeholderTextColor={C.textMuted}
          />

          {/* ช่องกรอก ราคา (บังคับใช้แป้นพิมพ์ตัวเลข keyboardType="numeric") */}
          <Text style={styles.label}>PRICE</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={handlePriceChange} // เรียกใช้ฟังก์ชันกรอง Regex
            keyboardType="numeric"
            placeholderTextColor={C.textMuted}
          />

          {/* ช่องกรอก สต็อก (กรองให้เหลือเฉพาะตัวเลข 0-9) */}
          <Text style={styles.label}>STOCK (UNITS)</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={t => { setStock(t.replace(/[^0-9]/g, '')); setErrorMsg(''); }}
            keyboardType="numeric"
            placeholderTextColor={C.textMuted}
          />

          {/* ช่องกรอก ลิงก์รูปภาพ */}
          <Text style={styles.label}>IMAGE URL</Text>
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={(t) => { setImage(t); setErrorMsg(''); }}
            placeholderTextColor={C.textMuted}
          />

          {/* ปุ่ม Save Changes */}
          <Pressable
            // ผสมสไตล์: ถ้ากำลังโหลดอยู่ (isSubmitting) จะเปลี่ยนสีปุ่มให้ดูทึบลง
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSaveEdit}
            disabled={isSubmitting} // ป้องกันการกดเบิ้ล
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Pressable>

          {/* ปุ่มยกเลิก กลับหน้าหลัก */}
          <Pressable style={styles.cancelBtn} onPress={() => router.replace('/?admin=true')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// 8. ส่วนจัดรูปแบบความสวยงาม (CSS/Styles)
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0B1628', paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  logo: { fontSize: 16, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  backBtn: {
    backgroundColor: C.surface2, paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
  formWrapper: { maxWidth: 560, alignSelf: 'center', width: '90%', paddingTop: 30 },
  formHeader: { marginBottom: 28 },
  formTitle: { color: C.gold, fontSize: 22, fontWeight: '900' },
  formSub: { color: C.textMuted, fontSize: 13, marginTop: 6 },
  idChip: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
  },
  idChipText: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#991b1b',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  successBox: {
    backgroundColor: '#064e3b', borderWidth: 1, borderColor: '#065f46',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  successText: { color: '#6ee7b7', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7, marginTop: 18 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
  },
  saveBtn: {
    backgroundColor: C.gold, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
  },
  saveBtnDisabled: { backgroundColor: '#5a4a1e' },
  saveBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 14, padding: 8 },
  cancelBtnText: { color: C.textMuted, fontSize: 14 },
});