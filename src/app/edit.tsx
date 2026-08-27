// ============================================================
// edit.tsx — หน้าแก้ไขสินค้า (Edit Product)
// ============================================================
// หน้านี้ใช้สำหรับ Admin แก้ไขข้อมูลสินค้าที่มีอยู่แล้ว
// ข้อมูลสินค้าเดิมจะถูกส่งมาผ่าน URL query parameter (params.product)
// เมื่อแก้ไขเสร็จจะส่ง PUT request ไป server แล้ว redirect กลับหน้าหลัก
// ============================================================

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

// ── ชุดสี (Color Palette) ──
const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444', green: '#10B981',
};

export default function EditProductScreen() {
  // router — ใช้สำหรับเปลี่ยนหน้า (navigate)
  const router = useRouter();
  // params — อ่าน query parameter จาก URL
  // ตัวอย่าง: /edit?product={...JSON...} → params.product จะได้ JSON string ของสินค้า
  const params = useLocalSearchParams();

  // ══════════════════════════════════════
  // State ทั้งหมดของหน้า Edit
  // ══════════════════════════════════════
  // name — ชื่อสินค้าที่จะแก้ไข
  const [name, setName] = useState('');
  // price — ราคาสินค้า (เก็บเป็น string เพราะอ่านจาก TextInput)
  const [price, setPrice] = useState('');
  // stock — จำนวนสต็อกคงเหลือ
  const [stock, setStock] = useState('');
  // image — URL ของรูปภาพสินค้า
  const [image, setImage] = useState('');
  // productId — ID ของสินค้าที่กำลังแก้ไข (ใช้ส่งไปกับ PUT request)
  const [productId, setProductId] = useState(null);
  // isSubmitting — สถานะกำลังบันทึก (true = กำลังส่งข้อมูล, ปุ่มจะ disable)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // errorMsg — ข้อความ error (เช่น "กรุณากรอกข้อมูลให้ครบ")
  const [errorMsg, setErrorMsg] = useState('');
  // successMsg — ข้อความสำเร็จ (เช่น "อัปเดตสินค้าเรียบร้อย!")
  const [successMsg, setSuccessMsg] = useState('');

  // ══════════════════════════════════════
  // useEffect — ดึงข้อมูลสินค้าเดิมจาก URL parameter
  // ══════════════════════════════════════
  // useEffect นี้จะทำงานเมื่อ params.product เปลี่ยนแปลง
  // ทำหน้าที่:
  // 1. อ่าน JSON string ของสินค้าจาก URL parameter (params.product)
  // 2. แปลง JSON string เป็น object ด้วย JSON.parse()
  // 3. นำข้อมูลเดิม (ชื่อ, ราคา, สต็อก, รูป, ID) ไปใส่ใน state
  //    เพื่อแสดงในฟอร์มให้ Admin เห็นค่าเดิมก่อนแก้ไข
  // decodeURIComponent() — ถอดรหัส URL encoding (เช่น %20 → ช่องว่าง)
  useEffect(() => {
    if (params.product) {
      try {
        // แปลง JSON string จาก URL กลับเป็น object สินค้า
        const item = JSON.parse(decodeURIComponent(params.product as string));
        // ดึงค่าแต่ละฟิลด์ไปใส่ใน state
        setProductId(item.id);
        setName(item.name || '');
        // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกจากราคา (เช่น "฿1,290" → "1290")
        const rawPrice = String(item.price || '').replace(/[^0-9.]/g, '');
        setPrice(rawPrice);
        setStock(String(item.stock || ''));
        // รองรับทั้ง field ชื่อ image และ image_url
        setImage(item.image || item.image_url || '');
      } catch (e) { console.error(e); }
    }
  }, [params.product]);

  // handlePriceChange — จัดการการพิมพ์ในช่องราคา
  // กรองให้เหลือเฉพาะตัวเลขและจุดทศนิยม (ลบตัวอักษรอื่นออก)
  const handlePriceChange = (text: string) => {
    const num = text.replace(/[^0-9.]/g, '');
    setPrice(num);
    setErrorMsg('');
  };

  // ══════════════════════════════════════
  // handleSaveEdit — บันทึกการแก้ไขสินค้า
  // ══════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. ตรวจสอบว่ากรอกข้อมูลครบทุกช่อง
  // 2. ทำความสะอาดข้อมูล (ลบตัวอักษรพิเศษออก)
  // 3. ส่ง PUT request ไปที่ /products/:id เพื่ออัปเดตข้อมูลใน server
  // 4. ถ้าสำเร็จ → แสดง success message แล้ว redirect กลับหน้าหลัก
  // 5. ถ้าไม่สำเร็จ → แสดง error message
  const handleSaveEdit = async () => {
    // ล้าง message เก่า
    setErrorMsg('');
    setSuccessMsg('');

    // Validation — ตรวจว่ากรอกครบทุกช่อง
    if (!name || !price || !stock || !image) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // ทำความสะอาดข้อมูลก่อนส่ง
      // cleanPrice — เหลือเฉพาะตัวเลขและจุดทศนิยม
      const cleanPrice = price.replace(/[^0-9.]/g, '');
      // cleanStock — เหลือเฉพาะตัวเลข (ไม่มีทศนิยม)
      const cleanStock = stock.replace(/[^0-9]/g, '');

      // ดึง JWT Token ที่เก็บไว้ตอน login
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

      // ส่ง PUT request ไป server เพื่ออัปเดตสินค้า
      // PUT method — ใช้สำหรับ "อัปเดต" ข้อมูลที่มีอยู่แล้ว (ต่างจาก POST ที่ใช้สร้างใหม่)
      // URL: /products/:productId — ระบุ ID ของสินค้าที่จะแก้ไข
      // Authorization header — ส่ง JWT Token เพื่อยืนยันตัวตน (เฉพาะ Admin เท่านั้น)
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, stock: cleanStock, price: cleanPrice, image })
      });
      const data = await response.json();

      // ตรวจสอบผลลัพธ์
      if (response.ok && data.success) {
        // สำเร็จ → แสดงข้อความ success
        setSuccessMsg('Product updated successfully!');
        // รอ 800ms แล้ว redirect กลับหน้าหลัก (admin mode)
        // ใส่ refresh=Date.now() เพื่อบังคับให้โหลดข้อมูลใหม่
        setTimeout(() => {
          router.replace(`/?admin=true&refresh=${Date.now()}`);
        }, 800);
      } else {
        // server ตอบว่าไม่สำเร็จ → แสดง error จาก server
        setErrorMsg(data.error || data.message || 'Failed to update product');
      }
    } catch (e) {
      // เกิด error ในการเชื่อมต่อ
      console.error('Edit save error:', e, 'URL:', `${API_BASE_URL}/products/${productId}`);
      setErrorMsg('Cannot connect to server: ' + (e.message || String(e)));
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── แถบด้านบน (Top Bar) — โลโก้ + ปุ่มกลับ ── */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        {/* ปุ่มกลับไปหน้าหลัก (admin mode) */}
        <Pressable style={styles.backBtn} onPress={() => router.replace('/?admin=true')}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formWrapper}>
          {/* ── หัวข้อฟอร์ม ── */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Edit Eyewear</Text>
            <Text style={styles.formSub}>Update the product details below</Text>
            {/* แสดง ID ของสินค้าที่กำลังแก้ไข (ถ้ามี) */}
            {productId && (
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>{'Editing ID: ' + productId}</Text>
              </View>
            )}
          </View>

          {/* ── แสดง Error Message ── */}
          {/* จะปรากฏเฉพาะเมื่อ errorMsg ไม่ว่าง — กล่องสีแดงเข้ม */}
          {errorMsg !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* ── แสดง Success Message ── */}
          {/* จะปรากฏเมื่ออัปเดตสำเร็จ — กล่องสีเขียวเข้ม */}
          {successMsg !== '' && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* ── ช่องกรอก: ชื่อสินค้า ── */}
          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(t) => { setName(t); setErrorMsg(''); }}
            placeholderTextColor={C.textMuted}
          />

          {/* ── ช่องกรอก: ราคา ── */}
          {/* ใช้ handlePriceChange เพื่อกรองให้พิมพ์ได้เฉพาะตัวเลข */}
          <Text style={styles.label}>PRICE</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
            placeholderTextColor={C.textMuted}
          />

          {/* ── ช่องกรอก: จำนวนสต็อก ── */}
          {/* กรองให้พิมพ์ได้เฉพาะตัวเลขด้วย replace(/[^0-9]/g, '') */}
          <Text style={styles.label}>STOCK (UNITS)</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={t => { setStock(t.replace(/[^0-9]/g, '')); setErrorMsg(''); }}
            keyboardType="numeric"
            placeholderTextColor={C.textMuted}
          />

          {/* ── ช่องกรอก: URL รูปภาพ ── */}
          <Text style={styles.label}>IMAGE URL</Text>
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={(t) => { setImage(t); setErrorMsg(''); }}
            placeholderTextColor={C.textMuted}
          />

          {/* ── ปุ่มบันทึก ── */}
          <Pressable
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSaveEdit}
            disabled={isSubmitting}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Pressable>

          {/* ── ปุ่มยกเลิก — กลับไปหน้าหลักโดยไม่บันทึก ── */}
          <Pressable style={styles.cancelBtn} onPress={() => router.replace('/?admin=true')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════
// Styles — การจัดรูปแบบ UI ของหน้า Edit
// ══════════════════════════════════════
const styles = StyleSheet.create({
  // container — ครอบทั้งหน้า
  container: { flex: 1, backgroundColor: C.bg },
  // topBar — แถบด้านบน (โลโก้ + ปุ่มกลับ)
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0B1628', paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  // logo — ข้อความ "MING OPTIC" สีทอง
  logo: { fontSize: 16, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  // backBtn — ปุ่มกลับ
  backBtn: {
    backgroundColor: C.surface2, paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
  // formWrapper — กรอบฟอร์มจัดกลาง (maxWidth 560px)
  formWrapper: { maxWidth: 560, alignSelf: 'center', width: '90%', paddingTop: 30 },
  // formHeader — ส่วนหัวของฟอร์ม
  formHeader: { marginBottom: 28 },
  formTitle: { color: C.gold, fontSize: 22, fontWeight: '900' },
  formSub: { color: C.textMuted, fontSize: 13, marginTop: 6 },
  // idChip — ป้ายแสดง Product ID ที่กำลังแก้ไข (chip/badge)
  idChip: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
  },
  idChipText: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  // errorBox — กล่อง error สีแดงเข้ม
  errorBox: {
    backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#991b1b',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  // successBox — กล่อง success สีเขียวเข้ม
  successBox: {
    backgroundColor: '#064e3b', borderWidth: 1, borderColor: '#065f46',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  successText: { color: '#6ee7b7', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  // label — ป้ายกำกับแต่ละช่อง (เช่น "PRODUCT NAME")
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7, marginTop: 18 },
  // input — ช่องกรอกข้อมูล
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
  },
  // saveBtn — ปุ่มบันทึก สีทอง
  saveBtn: {
    backgroundColor: C.gold, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
  },
  // saveBtnDisabled — ปุ่มบันทึกเมื่อ disabled (สีเข้มลง)
  saveBtnDisabled: { backgroundColor: '#5a4a1e' },
  saveBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16 },
  // cancelBtn — ปุ่มยกเลิก
  cancelBtn: { alignItems: 'center', marginTop: 14, padding: 8 },
  cancelBtnText: { color: C.textMuted, fontSize: 14 },
});