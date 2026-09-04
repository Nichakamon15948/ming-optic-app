// ════════════════════════════════════════════════════════════
// ไฟล์ชื่อ — use-theme.ts ฮุกสำหรับเรียกใช้ชุดสี (Theme Hook)
// ════════════════════════════════════════════════════════════
// หน้าที่ของไฟล์:
// สร้าง Custom Hook ที่ชื่อว่า `useTheme` สำหรับดึงชุดสีที่ถูกต้องมาใช้งาน
// โดยจะสอดคล้องกับโหมดปัจจุบันของอุปกรณ์ (Light/Dark Mode) แบบอัตโนมัติ

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ════════════════════════════════════════════════════════════
// ฟังก์ชัน useTheme
// ════════════════════════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. เรียกใช้ useColorScheme() เพื่อเช็คว่าอุปกรณ์ปัจจุบันใช้โหมดอะไร
// 2. ถ้าหาโหมดไม่เจอ (unspecified) ให้ตั้งค่าเริ่มต้นเป็นโหมดสว่าง ('light')
// 3. คืนค่าชุดสีจาก Colors object (ที่นำเข้ามาจากไฟล์ theme) ตามโหมดที่ได้มา
export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
