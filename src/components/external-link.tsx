// ════════════════════════════════════════
// external-link.tsx — ตัวจัดการลิงก์ภายนอก
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// คอมโพเนนต์ที่ช่วยจัดการเมื่อผู้ใช้กดลิงก์ที่ออกไปยังภายนอกแอป (External Link)
// เพื่อให้แอปสามารถใช้ In-App Browser (เปิดเว็บซ้อนในแอป) ได้อย่างถูกต้องเมื่ออยู่บนมือถือ
// ส่วนถ้าอยู่บนเว็บ ก็จะทำงานเหมือนลิงก์ <a> ปกติเปิดหน้าต่างใหม่

import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

// กำหนด Type ของ Props
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

// ════════════════════════════════════════
// ExternalLink — คอมโพเนนต์ลิงก์ภายนอก
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. รับค่า `href` ที่เป็นลิงก์ปลายทาง
// 2. ดักจับอีเวนต์ `onPress` เมื่อผู้ใช้กด
// 3. เช็คระบบปฏิบัติการ ถ้าไม่ใช่ 'web' (คือ Native: iOS/Android) จะหยุดการทำงานปกติ
// 4. เปิด In-App Browser ผ่าน `openBrowserAsync`
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
