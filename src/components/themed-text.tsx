// ════════════════════════════════════════
// themed-text.tsx — คอมโพเนนต์ Text แบบรองรับธีม (Themed Text)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// ไฟล์นี้เป็นคอมโพเนนต์ ThemedText ที่สร้างขึ้นจาก Expo template เพื่อรองรับการสลับธีม (Light/Dark mode)
// ช่วยให้ไม่ต้องกำหนดสี text แบบ manual โดยจะดึงค่าสีมาจาก ThemeColor ที่ตั้งค่าไว้

import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ────────────────────────────────────────
// Type: ThemedTextProps
// ขยายคุณสมบัติจาก TextProps โดยเพิ่ม 
// - type: สำหรับระบุสไตล์ของข้อความที่กำหนดไว้ (เช่น title, small, link)
// - themeColor: สีพื้นฐานที่อ้างอิงตามธีม
export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

// ════════════════════════════════════════
// ThemedText — คอมโพเนนต์แสดงข้อความ
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. เรียกใช้งาน `useTheme()` เพื่อรับค่าสีตามธีมปัจจุบันของแอป
// 2. ดึง type และ themeColor จาก props ถ้าไม่มีจะใช้ค่า 'default'
// 3. รวมสไตล์สีที่ได้จากธีมเข้ากับสไตล์ที่กำหนดไว้ล่วงหน้าจาก stylesheet อิงตามค่า `type` ที่ส่งเข้ามา
export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
