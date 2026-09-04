// ════════════════════════════════════════
// app-tabs.tsx — Tab Navigation สำหรับ Native (iOS/Android)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// ไฟล์นี้มาจากเทมเพลต Expo ดั้งเดิม ใช้สร้างแถบ Tab ด้านล่างหน้าจอ
// สำหรับแอปที่รันบน iOS/Android (ไม่ใช่เว็บ)
// ⚠️ แอป Ming Optic ใช้ Drawer Navigation แทน Tab จึงไม่ได้เรียกใช้ไฟล์นี้โดยตรง
//
// การทำงาน:
// 1. ดึงสี theme ปัจจุบัน (light/dark) จาก useColorScheme
// 2. สร้าง NativeTabs พร้อม 2 แท็บ: Home และ Explore
// 3. แต่ละแท็บมี Label (ชื่อ) และ Icon (ไอคอนรูปภาพ)
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
