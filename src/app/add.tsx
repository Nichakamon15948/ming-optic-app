// ============================================================
// add.tsx — หน้าเพิ่มสินค้าใหม่ (Add Product)
// ============================================================
// หน้านี้ใช้สำหรับ Admin เพิ่มสินค้าใหม่เข้าสู่ระบบ
// มีระบบ validate ตรวจสอบข้อมูลก่อนส่ง
// เมื่อเพิ่มสำเร็จจะ redirect กลับหน้าหลัก (admin mode)
// ============================================================

import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';


const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', goldLight: '#E2C97E',
  text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444', green: '#10B981',
};

type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function AddProductScreen() {
  // router — ใช้สำหรับเปลี่ยนหน้า (navigate)
  const router = useRouter();

  // ══════════════════════════════════════
  // State ทั้งหมดของหน้า Add
  // ══════════════════════════════════════
  // name — ชื่อสินค้า (เช่น "Round Metal Sunglasses")
  const [name, setName] = useState('');
  // price — ราคาสินค้า (เก็บเป็น string เพราะมาจาก TextInput)
  const [price, setPrice] = useState('');
  // stock — จำนวนสต็อก (หน่วย)
  const [stock, setStock] = useState('');
  // image — URL ของรูปภาพสินค้า
  const [image, setImage] = useState('');
  // errors — object เก็บข้อความ error ของแต่ละ field
  // ตัวอย่าง: { name: 'Product Name is required.' }
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
  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
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
  const handleAddProduct = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // สร้างรหัสสินค้าอัตโนมัติ: ดึงสินค้าทั้งหมดจาก server แล้วหาเลขล่าสุด
      const listRes = await fetch(`${API_BASE_URL}/products`);
      const allItems = await listRes.json();
      let newId = 'P001';
      if (Array.isArray(allItems) && allItems.length > 0) {
        // หาเลขสูงสุดที่ขึ้นต้นด้วย P
        let maxNum = 0;
        allItems.forEach(item => {
          const id = item.id || '';
          if (/^P\d+$/i.test(id)) {
            const num = parseInt(id.substring(1), 10);
            if (num > maxNum) maxNum = num;
          }
        });
        newId = 'P' + String(maxNum + 1).padStart(3, '0');
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: name.trim(),
          stock: stock.replace(/[^0-9]/g, ''), 
          price, 
          image: image.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', `Product added! ID: ${newId}`);
        router.replace(`/?admin=true&refresh=${Date.now()}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to save product.');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Cannot connect to server.');
    } finally { setIsSubmitting(false); }
  };

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
            <Text style={styles.formSub}>Fill in the details below. The Product ID will be generated automatically.</Text>
          </View>

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
