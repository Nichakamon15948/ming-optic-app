// ════════════════════════════════════════
// web-badge.tsx — ป้ายแสดงเวอร์ชันและโลโก้ Expo (Web Badge)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// คอมโพเนนต์สำหรับแสดงป้าย (Badge) โลโก้ของ Expo พร้อมด้วยหมายเลขเวอร์ชันของแอป
// โดยจะเปลี่ยนภาพโลโก้ระหว่างเวอร์ชันสีขาวหรือดำตามการตั้งค่าแสงสว่างของระบบ

import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

// ════════════════════════════════════════
// WebBadge — คอมโพเนนต์สำหรับป้ายแสดงผล
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. ดึง `scheme` (light/dark) ด้วย `useColorScheme`
// 2. แสดง ThemedText สำหรับหมายเลขเวอร์ชัน (ดึงค่า `version` มาจาก package.json ของ expo)
// 3. แสดงรูปภาพโลโก้ หากธีมเป็น 'dark' ใช้รูปสีขาว หากไม่ใช่ใช้รูปปกติ
export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        v{version}
      </ThemedText>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={styles.badgeImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});
