// ============================================================
// _layout.tsx — ไฟล์ Layout หลักของแอป (Root Layout)
// ============================================================
// ไฟล์นี้ทำหน้าที่กำหนด "โครงสร้างการนำทาง" (Navigation Structure) ของแอปทั้งหมด


import { Drawer } from 'expo-router/drawer';
import { LogBox } from 'react-native';

// ซ่อน warning "Unexpected text node" ที่มาจาก Drawer library
// LogBox.ignoreLogs() รับ array ของข้อความ warning ที่ต้องการซ่อน
// ถ้า warning message มีคำที่ตรงกับในรายการนี้ จะไม่แสดงบนหน้าจอ
LogBox.ignoreLogs(['Unexpected text node']);

// RootLayout — คอมโพเนนต์หลักที่ครอบทุกหน้าจอ
// ทำหน้าที่ "จัดระเบียบ" ว่าแอปมีหน้าไหนบ้าง และแต่ละหน้าจะแสดงยังไงใน Drawer
export default function RootLayout() {
  return (
    <Drawer
      // screenOptions — ตั้งค่าที่ใช้ร่วมกันสำหรับทุก Screen
      screenOptions={{
        // drawerActiveTintColor — สีของเมนูที่กำลังถูกเลือก (active) ในลิ้นชัก
        drawerActiveTintColor: '#C9A84C',
        // headerShown: false — ซ่อน Header อัตโนมัติ เพราะเราจะสร้าง Navbar เองในแต่ละหน้า
        headerShown: false,
      }}
    >
      {/* ── หน้าจอที่แสดงในเมนู Drawer ── */}
      {/* Drawer.Screen — แต่ละตัวคือ 1 หน้าจอในแอป */}
      {/* name คือชื่อไฟล์ใน app/ folder (ไม่ต้องมี .tsx) */}
      {/* options.title คือชื่อที่แสดงในเมนู Drawer */}

      {/* หน้าแรก (index.tsx) — แสดงรายการสินค้า */}
      <Drawer.Screen 
        name="index" 
        options={{ title: 'Home / Products' }} 
      />
      {/* หน้า Login สำหรับ Admin */}
      <Drawer.Screen 
        name="login" 
        options={{ title: 'Admin Login' }} 
      />

      {/* ── หน้าจอที่ซ่อนจากเมนู Drawer ── */}
      {/* drawerItemStyle: { display: 'none' } → ซ่อนเมนูนี้ไม่ให้แสดงในลิ้นชัก */}
      {/* หน้าเหล่านี้ยังเข้าถึงได้ผ่าน router.push() แต่ไม่แสดงในเมนู */}

      {/* หน้าเพิ่มสินค้า — เข้าถึงได้เฉพาะ Admin */}
      <Drawer.Screen 
        name="add" 
        options={{ title: 'Add Product', drawerItemStyle: { display: 'none' } }} 
      />
      {/* หน้าแก้ไขสินค้า — เข้าถึงได้เฉพาะ Admin */}
      <Drawer.Screen 
        name="edit" 
        options={{ title: 'Edit Product', drawerItemStyle: { display: 'none' } }} 
      />
      {/* หน้าตะกร้าสินค้า */}
      <Drawer.Screen 
        name="cart" 
        options={{ title: 'Cart', drawerItemStyle: { display: 'none' } }} 
      />
      {/* หน้า Explore — ซ่อนจากเมนู */}
      <Drawer.Screen 
        name="explore" 
        options={{ title: 'Explore', drawerItemStyle: { display: 'none' } }} 
      />
      {/* หน้า Products — ซ่อนจากเมนู */}
      <Drawer.Screen 
        name="products" 
        options={{ title: 'Products', drawerItemStyle: { display: 'none' } }} 
      />
      {/* หน้า Search — ซ่อนจากเมนู */}
      <Drawer.Screen 
        name="search" 
        options={{ title: 'Search', drawerItemStyle: { display: 'none' } }} 
      />
    </Drawer>
  );
}