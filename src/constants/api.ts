import { Platform } from 'react-native';

// ใช้ IP ที่เหมาะกับแต่ละ platform
// - Android Emulator: 10.0.2.2 จะชี้ไปที่ localhost ของเครื่องคอมพิวเตอร์
// - Web / iOS Simulator: ใช้ localhost ได้ปกติ
// - เครื่องจริง (มือถือ): ใช้ IP จริงของคอมพิวเตอร์ที่รัน server
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
        // หากเปิดผ่านเบราว์เซอร์ ให้ใช้ Hostname เดียวกันกับที่กำลังใช้งาน
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // หากรันบนเซิร์ฟเวอร์จริง ให้ยิงไปพอร์ต 3000 ของไอพีเซิร์ฟเวอร์นั้น
        return `http://${hostname}:3000/api`;
    }
    if (Platform.OS === 'android') {
        return 'http://192.168.110.122:3000/api'; // IP สำหรับการจำลองบน Emulator/มือถือ
    }
    return 'http://localhost:3000/api';
};

export const API_BASE_URL = getBaseUrl();
