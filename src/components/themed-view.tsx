// ════════════════════════════════════════
// themed-view.tsx — คอมโพเนนต์ View แบบรองรับธีม (Themed View)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// ไฟล์นี้เป็นคอมโพเนนต์ View แบบพิเศษที่จะเปลี่ยนสีพื้นหลัง (Background) 
// ให้สอดคล้องกับธีม (Light/Dark mode) ของแอปโดยอัตโนมัติ

import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ────────────────────────────────────────
// Type: ThemedViewProps
// ขยายจาก ViewProps พื้นฐาน โดยสามารถรับสีเฉพาะสำหรับ light/dark หรือรับเป็น type ของสีจากธีม
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

// ════════════════════════════════════════
// ThemedView — คอมโพเนนต์พื้นที่แสดงผล
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. เรียก `useTheme()` เพื่อดึงค่าการตั้งค่าสีของธีมปัจจุบัน
// 2. ถ้ามีการระบุ `type` (เช่น 'background', 'backgroundSelected') จะดึงสีตาม key นั้น
// 3. กำหนดสีพื้นหลังลงไปที่ View และส่งต่อ props ส่วนที่เหลือ
export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
