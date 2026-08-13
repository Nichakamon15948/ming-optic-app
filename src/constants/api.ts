import { Platform } from 'react-native';

// ใช้ IP ที่เหมาะกับแต่ละ platform
// - Android Emulator: 10.0.2.2 จะชี้ไปที่ localhost ของเครื่องคอมพิวเตอร์
// - Web / iOS Simulator: ใช้ localhost ได้ปกติ
// - เครื่องจริง (มือถือ): ใช้ IP จริงของคอมพิวเตอร์ที่รัน server
// ปรับค่าตรงนี้เพื่อเลือกว่าจะต่อฐานข้อมูลในเครื่อง (Local) หรือบนคลาวด์ (VPS)
const USE_VPS = true; 

const getBaseUrl = () => {
    if (USE_VPS) {
        return 'http://119.59.102.161:3018/api'; // IP และ Port บนเซิร์ฟเวอร์จริงของคุณ
    }

    if (typeof window !== 'undefined' && window.location) {
        // หากเปิดผ่านเบราว์เซอร์ Local
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        return `http://${hostname}:3000/api`;
    }
    if (Platform.OS === 'android') {
        return 'http://192.168.110.122:3000/api'; // IP วงแลนในเครื่อง
    }
    return 'http://localhost:3000/api';
};

export const API_BASE_URL = getBaseUrl();
