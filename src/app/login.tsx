// ============================================================
// login.tsx — หน้า Login สำหรับ Admin
// ============================================================
// หน้านี้เป็นฟอร์มเข้าสู่ระบบสำหรับผู้ดูแลระบบ (Admin)
// เมื่อ Login สำเร็จ จะ redirect ไปหน้าหลักพร้อม parameter admin=true
// เพื่อเปิดใช้งานฟังก์ชัน Admin (เพิ่ม/แก้ไข/ลบสินค้า)
// ============================================================

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

// ── ชุดสี (Color Palette) ที่ใช้ทั้งหน้า ──
const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444',
};

export default function LoginScreen() {
  // ══════════════════════════════════════
  // State ทั้งหมดของหน้า Login
  // ══════════════════════════════════════
  // username — เก็บค่าที่ผู้ใช้พิมพ์ในช่อง Username
  const [username, setUsername] = useState('');
  // password — เก็บค่าที่ผู้ใช้พิมพ์ในช่อง Password
  const [password, setPassword] = useState('');
  // loading — สถานะกำลังรอ response จาก server (true = กำลังรอ, ปุ่มจะ disable)
  const [loading, setLoading] = useState(false);
  // errorMsg — ข้อความ error ที่จะแสดงให้ผู้ใช้เห็น (ว่างเปล่า = ไม่มี error)
  const [errorMsg, setErrorMsg] = useState('');
  // router — ใช้สำหรับเปลี่ยนหน้า (navigate) ไปหน้าอื่น
  const router = useRouter();

  // ══════════════════════════════════════
  // handleLogin — ฟังก์ชันจัดการการ Login
  // ══════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. ล้าง error message เดิม
  // 2. ตรวจว่า username/password ไม่ว่างเปล่า
  // 3. ส่ง POST request ไปที่ /login endpoint ของ server
  // 4. ถ้า server ตอบ success → เก็บ token ลง localStorage → redirect ไปหน้าหลักแบบ admin
  // 5. ถ้าไม่สำเร็จ → แสดง error message
  const handleLogin = async () => {
    // ล้าง error เก่าทุกครั้งที่กดปุ่ม Login
    setErrorMsg('');

    // ตรวจสอบว่า username และ password ไม่ว่างเปล่า
    if (!username || !password) {
      setErrorMsg('Please enter username and password.');
      return;
    }

    // เปิดสถานะ loading (ปุ่มจะถูก disable + แสดงข้อความ "Signing in...")
    setLoading(true);
    try {
      // ส่ง POST request ไป API /login พร้อม username/password ในรูปแบบ JSON
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      // แปลง response เป็น JSON
      const data = await response.json();

      // ตรวจสอบผลลัพธ์จาก server
      if (data.success) {
        // Login สำเร็จ → เก็บ token ลง localStorage เพื่อใช้ยืนยันตัวตนในภายหลัง
        // (เช่น ตอนลบสินค้าจะส่ง token ไปกับ request)
        if (data.token) {
          try {
            localStorage.setItem('admin_token', data.token);
          } catch (e) {
            console.log('localStorage error:', e);
          }
        }
        // router.replace() — เปลี่ยนไปหน้าหลักพร้อม ?admin=true
        // ใช้ replace แทน push เพื่อไม่ให้กดย้อนกลับมาหน้า Login ได้
        router.replace('/?admin=true');
      } else {
        // Login ไม่สำเร็จ → แสดง error ว่ารหัสผ่านผิด
        setErrorMsg('Username or password is incorrect.');
      }
    } catch (error) {
      // เกิด error ในการเชื่อมต่อ (เช่น server ไม่ได้เปิดอยู่)
      setErrorMsg('Cannot connect to server. Make sure server.js is running.');
    } finally {
      // ปิดสถานะ loading ไม่ว่าจะสำเร็จหรือไม่
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── วงกลมพื้นหลัง (Background Decorative Circles) ── */}
      {/* เป็นแค่วงกลมโปร่งแสงสีทองเพื่อความสวยงามของ UI ไม่มี functionality */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* ── Card ฟอร์ม Login ── */}
      <View style={styles.card}>
        {/* โลโก้ร้าน */}
        <Text style={styles.logoText}>MING OPTIC</Text>
        <Text style={styles.logoSub}>Admin Portal</Text>

        {/* เส้นคั่นระหว่างโลโก้กับฟอร์ม */}
        <View style={styles.divider} />

        {/* หัวข้อฟอร์ม */}
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Enter your credentials to access the admin panel</Text>

        {/* ── กล่องแสดง Error Message ── */}
        {/* จะแสดงเฉพาะเมื่อ errorMsg ไม่เป็นค่าว่าง */}
        {/* มี background สีแดงเข้ม + ข้อความสีแดงอ่อน เพื่อดึงดูดความสนใจ */}
        {errorMsg !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* ── ช่อง Username ── */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          // ถ้ามี error จะเพิ่ม style ขอบแดง (inputError)
          style={[styles.input, errorMsg !== '' && styles.inputError]}
          placeholder="Enter username"
          placeholderTextColor={C.textMuted}
          value={username}
          // เมื่อพิมพ์ → อัปเดต state username + ล้าง error message
          onChangeText={(t) => { setUsername(t); setErrorMsg(''); }}
          // autoCapitalize="none" → ไม่ขึ้นต้นด้วยตัวพิมพ์ใหญ่อัตโนมัติ
          autoCapitalize="none"
          // autoCorrect={false} → ปิดระบบแก้คำอัตโนมัติ (ไม่เหมาะกับ username)
          autoCorrect={false}
        />

        {/* ── ช่อง Password ── */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, errorMsg !== '' && styles.inputError]}
          placeholder="Enter password"
          placeholderTextColor={C.textMuted}
          value={password}
          onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
          // secureTextEntry — คืออะไร?
          // ─────────────────────────────────────────
          // secureTextEntry={true} ทำให้ตัวอักษรที่พิมพ์ถูกซ่อนเป็นจุด (•••••)
          // เพื่อป้องกันคนอื่นเห็นรหัสผ่านขณะพิมพ์
          // เป็น property มาตรฐานของ TextInput ใน React Native
          secureTextEntry
          autoCorrect={false}
          autoCapitalize="none"
          // autoComplete="off" → ปิดระบบ autocomplete ของ browser (สำหรับ web)
          autoComplete="off"
          // spellCheck={false} → ปิดการตรวจสะกดคำ
          spellCheck={false}
          // textContentType="password" → บอก OS ว่าช่องนี้เป็น password
          // เพื่อให้ Keychain / Password Manager ทำงานได้ถูกต้อง (iOS)
          textContentType="password"
        />

        {/* ── ปุ่ม Sign In ── */}
        <Pressable
          // ถ้ากำลังโหลด → เพิ่ม style disabled (สีเข้มขึ้น)
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          // disabled={loading} → กด Login ไม่ได้ขณะกำลังรอ server ตอบ
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {/* แสดง "Signing in..." ขณะรอ หรือ "Sign In" ตอนปกติ */}
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>

        {/* ── ปุ่มกลับไปหน้าร้าน ── */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Store</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════
// Styles — การจัดรูปแบบ UI ของหน้า Login
// ══════════════════════════════════════
const styles = StyleSheet.create({
  // container — ครอบทั้งหน้า, จัดกลางทั้งแนวตั้งและแนวนอน
  container: {
    flex: 1, backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  // bgCircle1, bgCircle2 — วงกลมตกแต่ง (decorative) มุมบนขวาและล่างซ้าย
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.06)', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(201,168,76,0.04)', bottom: 60, left: -60,
  },
  // card — กล่องฟอร์ม Login มีเงาและขอบมน
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: C.surface,
    padding: 32, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  // logoText — ข้อความ "MING OPTIC" สีทอง ตัวหนา
  logoText: {
    fontSize: 22, fontWeight: '900', color: C.gold,
    letterSpacing: 4, textAlign: 'center',
  },
  // logoSub — ข้อความ "Admin Portal" ใต้โลโก้
  logoSub: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4, letterSpacing: 2 },
  // divider — เส้นคั่นแนวนอน
  divider: { height: 1, backgroundColor: C.border, marginVertical: 24 },
  // title — หัวข้อ "Sign In"
  title: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  // subtitle — คำอธิบายย่อยใต้หัวข้อ
  subtitle: { color: C.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 18 },
  // errorBox — กล่อง error สีแดงเข้ม
  errorBox: {
    backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#991b1b',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  // errorText — ข้อความ error สีแดงอ่อน
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  // label — ป้ายกำกับ (เช่น "Username", "Password")
  label: { color: C.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  // input — ช่องกรอกข้อมูล (TextInput)
  input: {
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
  },
  // inputError — style เพิ่มเติมเมื่อมี error (เปลี่ยนขอบเป็นสีแดง)
  inputError: { borderColor: C.red },
  // loginBtn — ปุ่ม Sign In สีทอง
  loginBtn: {
    backgroundColor: C.gold, padding: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 28,
  },
  // loginBtnDisabled — style ปุ่มเมื่อ disabled (สีเข้มลง)
  loginBtnDisabled: { backgroundColor: '#5a4a1e' },
  // loginBtnText — ข้อความในปุ่ม Sign In
  loginBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  // backBtn — ปุ่มกลับไปหน้าร้าน (ไม่มีพื้นหลัง)
  backBtn: { alignItems: 'center', marginTop: 16, padding: 8 },
  // backBtnText — ข้อความปุ่มกลับ
  backBtnText: { color: C.textMuted, fontSize: 14 },
});