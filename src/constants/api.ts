import { Platform } from 'react-native';

// ใช้ IP ที่เหมาะกับแต่ละ platform
// - Android Emulator: 10.0.2.2 จะชี้ไปที่ localhost ของเครื่องคอมพิวเตอร์
// - Web / iOS Simulator: ใช้ localhost ได้ปกติ
// - เครื่องจริง (มือถือ): ใช้ IP จริงของคอมพิวเตอร์ที่รัน server
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://192.168.110.122:3000'; // IP จริงของเครื่อง (Wi-Fi)
    }
    return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();
