// ════════════════════════════════════════════════════════════
// ไฟล์ชื่อ — theme.ts การจัดการชุดสี ฟอนต์ และช่องไฟ (Theme Configuration)
// ════════════════════════════════════════════════════════════
// หน้าที่ของไฟล์:
// เก็บค่าคงที่สำหรับการแสดงผลของแอป (UI Constants) เช่น โทนสี 
// สำหรับ Light Mode และ Dark Mode, การตั้งค่าฟอนต์ในแต่ละแพลตฟอร์ม 
// และระยะห่างต่างๆ เพื่อให้แอปมีความเป็นมาตรฐานและดูแลรักษาง่าย

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ────────────────────────────────────────
// Colors (ชุดสีที่ใช้ในแอป)
// ────────────────────────────────────────
// ออบเจกต์ที่แยกเก็บชุดสีสำหรับ 2 โหมด
// - light: สีสำหรับสว่าง เช่น พื้นหลังสีขาว, ข้อความสีดำ
// - dark: สีสำหรับมืด เช่น พื้นหลังสีดำ, ข้อความสีขาว
// การจัดเก็บแบบนี้ช่วยให้สามารถสลับโหมดสีแอปได้อย่างราบรื่น
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

// ────────────────────────────────────────
// ThemeColor Type
// ────────────────────────────────────────
// การกำหนดชนิดข้อมูล (Type) สำหรับชื่อสีที่มีอยู่
// ช่วยป้องกันการพิมพ์ชื่อสีผิดตอนเขียนโค้ด (Type Checking)
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ────────────────────────────────────────
// Fonts (รูปแบบตัวอักษร)
// ────────────────────────────────────────
// กำหนดฟอนต์ที่เหมาะสมสำหรับแต่ละแพลตฟอร์ม
// - ios: ใช้ฟอนต์มาตรฐานระบบ (System Design) ของ iOS
// - web: เรียกใช้ตัวแปร CSS (CSS Variables) จากไฟล์ global.css
// - default: ฟอนต์พื้นฐานทั่วไป สำหรับ Android หรือระบบอื่นๆ
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ────────────────────────────────────────
// Spacing & Layout (ระยะห่างและการจัดวาง)
// ────────────────────────────────────────
// Spacing: ตัวคูณสำหรับกำหนดระยะห่าง (Margin, Padding) แบบเป็นระบบ
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// BottomTabInset: ระยะขอบล่างสำหรับหลบแถบเมนู (Bottom Tab) ตามแพลตฟอร์ม
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
// MaxContentWidth: ความกว้างสูงสุดของเนื้อหา (ใช้บ่อยในหน้าจอแท็บเล็ต/เว็บ)
export const MaxContentWidth = 800;
