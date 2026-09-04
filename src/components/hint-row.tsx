// ════════════════════════════════════════
// hint-row.tsx — แถบแสดงคำแนะนำโค้ด (Hint Row)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// คอมโพเนนต์สำหรับแสดงกล่องคำแนะนำ มักใช้สำหรับแนะนำไฟล์โค้ดที่ควรไปแก้ไขต่อ

import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

// ════════════════════════════════════════
// HintRow — คอมโพเนนต์หลักแสดง Hint
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. แสดง `title` เป็นชื่อของคำแนะนำ (ค่าเริ่มต้น "Try editing")
// 2. แสดง `hint` เป็นชื่อไฟล์หรือโค้ดคำแนะนำในกล่อง (ค่าเริ่มต้น "app/index.tsx")
// 3. ใช้ ThemedText และ ThemedView เพื่อให้สอดคล้องกับธีมของแอป
export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={styles.stepRow}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
});
