// ════════════════════════════════════════
// animated-icon.tsx — แอนิเมชันตอนเปิดแอป (Splash Animation)
// ════════════════════════════════════════
// อธิบายรายละเอียด:
// ไฟล์นี้รวบรวมคอมโพเนนต์สำหรับแอนิเมชัน Splash Screen ที่จะแสดงตอนเปิดแอปพลิเคชัน
// มีการทำงานของ Reanimated ช่วยให้ไอคอนและฉากหลังค่อยๆ เลือนหาย/ขยายขึ้นอย่างราบรื่น

import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

// ════════════════════════════════════════
// AnimatedSplashOverlay — หน้าจอคั่นเวลาพร้อมแอนิเมชัน
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. เริ่มต้นหน้าจอด้วย SplashScreen.hideAsync() เพื่อซ่อน Splash Screen เริ่มต้นของระบบ
// 2. ใช้ `splashKeyframe` กำหนดทิศทางการเฟดออก (Opacity 1 -> 0) และการขยาย
// 3. เมื่อแอนิเมชันเล่นจบ จะเซ็ต `visible` เป็น false ทำให้หน้าจอคั่นเวลานี้หายไป
export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />;

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {image}
    </View>
  );
}

// ────────────────────────────────────────
// Keyframes ข้อมูลการเคลื่อนไหว
// สำหรับ AnimatedIcon ได้แก่ การขยายฉากหลัง (keyframe), การขยายโลโก้ (logoKeyframe), การหมุนเรืองแสง (glowKeyframe)
const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

// ════════════════════════════════════════
// AnimatedIcon — ไอคอนแอปพลิเคชันแบบเคลื่อนไหว
// ════════════════════════════════════════
// ขั้นตอนการทำงาน:
// 1. ประกอบด้วย 레이เยอร์ หลายชั้นซ้อนกัน (พื้นหลัง, ไอคอนเรืองแสง, โลโก้)
// 2. เรียกใช้ Keyframes ที่กำหนดไว้ด้านบนเพื่อสร้างแอนิเมชันให้แต่ละเลเยอร์พร้อมกัน
export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
