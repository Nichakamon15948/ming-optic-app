// ============================================================
// add.tsx — หน้าเพิ่มสินค้าใหม่ (Add Product)
// ============================================================
// หน้านี้ใช้สำหรับ Admin เพิ่มสินค้าใหม่เข้าสู่ระบบ
// มีระบบ validate ตรวจสอบข้อมูลก่อนส่ง
// เมื่อเพิ่มสำเร็จจะ redirect กลับหน้าหลัก (admin mode)
// ============================================================

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';


const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', goldLight: '#E2C97E',
  text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444', green: '#10B981',
};

export default function AddProductScreen() {
  // router — ใช้สำหรับเปลี่ยนหน้า (navigate)
  const router = useRouter();

  // ══════════════════════════════════════
  // State ทั้งหมดของหน้า Add
  // ══════════════════════════════════════
  // productId — รหัสสินค้า (เช่น "P004") ผู้ใช้กรอกเอง
  const [productId, setProductId] = useState('');
  // name — ชื่อสินค้า (เช่น "Round Metal Sunglasses")
  const [name, setName] = useState('');
  // price — ราคาสินค้า (เก็บเป็น string เพราะมาจาก TextInput)
  const [price, setPrice] = useState('');
  // stock — จำนวนสต็อก (หน่วย)
  const [stock, setStock] = useState('');
  // image — URL ของรูปภาพสินค้า
  const [image, setImage] = useState('');
  // errors — object เก็บข้อความ error ของแต่ละ field
  // ตัวอย่าง: { productId: 'Product ID is required.', name: '' }
  // ใช้ key เป็นชื่อ field, value เป็น error message (ว่าง = ไม่มี error)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // isSubmitting — สถานะกำลังส่งข้อมูล (true = กำลังรอ server, ปุ่มจะ disable)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handlePriceChange — จัดการการพิมพ์ในช่องราคา
  // กรองให้เหลือเฉพาะตัวเลข (ลบตัวอักษร, เครื่องหมาย, ช่องว่าง ออกหมด)
  const handlePriceChange = (text: string) => {
    const num = text.replace(/[^0-9]/g, '');
    setPrice(num);
    // ล้าง error ของช่อง price เมื่อเริ่มพิมพ์
    if (errors.price) setErrors(p => ({ ...p, price: '' }));
  };

  // ══════════════════════════════════════
  // validate — ตรวจสอบข้อมูลก่อนส่ง (Form Validation)
  // ══════════════════════════════════════
  // ฟังก์ชันนี้จะตรวจสอบทุกช่อง แล้วเก็บ error message ไว้ใน object
  // ถ้าไม่มี error เลย → return true (ผ่าน validation)
  // ถ้ามี error → return false + set errors state เพื่อแสดงข้อความ error ใต้แต่ละช่อง
  //
  // เงื่อนไขการตรวจสอบ:
  // - productId: ต้องไม่ว่าง + ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น (A-Z, a-z, 0-9)
  // - name: ต้องไม่ว่าง + ต้องมีอย่างน้อย 2 ตัวอักษร
  // - price: ต้องไม่ว่าง + ต้องมีตัวเลข
  // - stock: ต้องไม่ว่าง
  // - image: ต้องไม่ว่าง + ต้องขึ้นต้นด้วย http:// หรือ https://
  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!productId.trim()) e.productId = 'Product ID is required.';
    else if (!/^[A-Za-z0-9]+$/.test(productId.trim())) e.productId = 'Letters and numbers only (e.g. P004).';
    if (!name.trim()) e.name = 'Product Name is required.';
    else if (name.trim().length < 2) e.name = 'At least 2 characters.';
    if (!price || !price.replace(/[^0-9]/g, '')) e.price = 'Price is required.';
    if (!stock) e.stock = 'Stock is required.';
    if (!image.trim()) e.image = 'Image URL is required.';
    else if (!/^https?:\/\/.+/i.test(image.trim())) e.image = 'Must start with http:// or https://';
    setErrors(e);
    // ถ้า object e ไม่มี key เลย → ผ่าน validation
    return Object.keys(e).length === 0;
  };

  // ══════════════════════════════════════
  // handleAddProduct — ส่งข้อมูลสินค้าใหม่ไป server
  // ══════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. เรียก validate() ตรวจสอบข้อมูล → ถ้าไม่ผ่านจะหยุดทันที
  // 2. ส่ง POST request ไปที่ /products endpoint พร้อมข้อมูลสินค้า
  // 3. ถ้าสำเร็จ → แสดง Alert "Success" แล้ว redirect กลับหน้าหลัก
  // 4. ถ้าไม่สำเร็จ → แสดง Alert "Error" พร้อมข้อความจาก server
  const handleAddProduct = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId.trim(), name: name.trim(),
          // ทำความสะอาดข้อมูลก่อนส่ง — เหลือเฉพาะตัวเลข
          stock: stock.replace(/[^0-9]/g, ''), price, image: image.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // เพิ่มสำเร็จ → แสดง Alert แจ้งเตือน
        Alert.alert('Success', 'Product added successfully!');
        // redirect กลับหน้าหลัก (admin mode) พร้อม refresh
        router.replace(`/?admin=true&refresh=${Date.now()}`);
      } else {
        // server ตอบว่าไม่สำเร็จ → แสดง error
        Alert.alert('Error', data.error || 'Failed to save product.');
      }
    } catch (e) {
      // ไม่สามารถเชื่อมต่อ server ได้
      Alert.alert('Connection Error', 'Cannot connect to server.');
    } finally { setIsSubmitting(false); }
  };

  // ══════════════════════════════════════
  // Field — คอมโพเนนต์ย่อยสำหรับแต่ละช่องกรอกข้อมูล
  // ══════════════════════════════════════
  // Field คือ "wrapper component" ที่ครอบ TextInput แต่ละตัว
  // ทำหน้าที่:
  // - แสดง label (ป้ายกำกับ) ด้านบน
  // - แสดง children (TextInput หรือ element อื่น) ตรงกลาง
  // - แสดง error message ด้านล่าง (ถ้ามี)
  // Props:
  // - label: ข้อความป้ายกำกับ (เช่น "PRODUCT NAME")
  // - error: ข้อความ error (ถ้ามี) จะแสดงเป็นสีแดงใต้ช่องกรอก
  // - children: element ที่จะครอบ (ส่วนใหญ่คือ TextInput)
  const Field = ({ label, error, children }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {/* แสดง error message เฉพาะเมื่อมี error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── แถบด้านบน (Top Bar) — โลโก้ + ปุ่มกลับ ── */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace(`/?admin=true&refresh=${Date.now()}`)}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formWrapper}>
          {/* ── หัวข้อฟอร์ม ── */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add New Eyewear</Text>
            <Text style={styles.formSub}>Fill in the details below to add a product to your catalog.</Text>
          </View>

          {/* ── ช่องกรอก: Product ID ── */}
          {/* ใช้ Field component ครอบ เพื่อแสดง label + error อัตโนมัติ */}
          <Field label="PRODUCT ID" error={errors.productId}>
            <TextInput
              // ถ้ามี error → เพิ่ม style ขอบแดง (inputErr)
              style={[styles.input, errors.productId && styles.inputErr]}
              placeholder="e.g. P004"
              placeholderTextColor={C.textMuted}
              value={productId}
              // เมื่อพิมพ์ → อัปเดต state + ล้าง error ของช่องนี้
              onChangeText={t => { setProductId(t); if (errors.productId) setErrors(p => ({ ...p, productId: '' })); }}
            />
          </Field>

          {/* ── ช่องกรอก: Product Name ── */}
          <Field label="PRODUCT NAME" error={errors.name}>
            <TextInput
              style={[styles.input, errors.name && styles.inputErr]}
              placeholder="e.g. Round Metal Sunglasses"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={t => { setName(t); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
            />
          </Field>

          {/* ── ช่องกรอก: Price ── */}
          {/* ใช้ handlePriceChange เพื่อกรองให้พิมพ์ได้เฉพาะตัวเลข */}
          <Field label="PRICE" error={errors.price}>
            <TextInput
              style={[styles.input, errors.price && styles.inputErr]}
              placeholder="e.g. 1290"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={handlePriceChange}
            />
          </Field>

          {/* ── ช่องกรอก: Stock ── */}
          <Field label="STOCK (UNITS)" error={errors.stock}>
            <TextInput
              style={[styles.input, errors.stock && styles.inputErr]}
              placeholder="e.g. 15"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={stock}
              // กรองให้เหลือเฉพาะตัวเลข
              onChangeText={t => { setStock(t.replace(/[^0-9]/g, '')); if (errors.stock) setErrors(p => ({ ...p, stock: '' })); }}
            />
          </Field>

          {/* ── ช่องกรอก: Image URL ── */}
          <Field label="IMAGE URL" error={errors.image}>
            <TextInput
              style={[styles.input, styles.inputMultiline, errors.image && styles.inputErr]}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={C.textMuted}
              value={image}
              onChangeText={t => { setImage(t); if (errors.image) setErrors(p => ({ ...p, image: '' })); }}
            />
          </Field>

          {/* ── ปุ่มเพิ่มสินค้า ── */}
          <Pressable
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleAddProduct}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {/* แสดง "Adding..." ขณะรอ หรือ "＋ Add Product" ตอนปกติ */}
              {isSubmitting ? 'Adding...' : '＋ Add Product'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════
// Styles — การจัดรูปแบบ UI ของหน้า Add
// ══════════════════════════════════════
const styles = StyleSheet.create({
  // container — ครอบทั้งหน้า
  container: { flex: 1, backgroundColor: C.bg },
  // topBar — แถบด้านบน
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0B1628', paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  // logo — ข้อความโลโก้สีทอง
  logo: { fontSize: 16, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  // backBtn — ปุ่มกลับ
  backBtn: {
    backgroundColor: C.surface2, paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
  // formWrapper — กรอบฟอร์มจัดกลาง
  formWrapper: {
    maxWidth: 560, alignSelf: 'center', width: '90%', paddingTop: 30,
  },
  formHeader: { marginBottom: 28 },
  formTitle: { color: C.gold, fontSize: 22, fontWeight: '900' },
  formSub: { color: C.textMuted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  // fieldGroup — กลุ่มของแต่ละ field (label + input + error)
  // ใช้ใน Field component
  fieldGroup: { marginBottom: 6 },
  // label — ป้ายกำกับ
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7, marginTop: 16 },
  // input — ช่องกรอกข้อมูล
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
  },
  // inputMultiline — style เพิ่มเติมสำหรับช่องที่อาจยาว (เช่น URL)
  inputMultiline: { minHeight: 44 },
  // inputErr — ขอบสีแดงเมื่อมี validation error
  inputErr: { borderColor: C.red, borderWidth: 2 },
  // errorText — ข้อความ error ใต้ช่องกรอก
  errorText: { color: C.red, fontSize: 12, marginTop: 5 },
  // submitBtn — ปุ่มเพิ่มสินค้า สีทอง
  submitBtn: {
    backgroundColor: C.gold, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
  },
  // submitBtnDisabled — ปุ่มเมื่อ disabled
  submitBtnDisabled: { backgroundColor: '#5a4a1e' },
  submitBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});