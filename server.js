/* ============================================================================
 *  server.js - ไฟล์หลักของ Backend Server สำหรับแอป Ming Optic
 * ============================================================================
 *  ไฟล์นี้ทำหน้าที่เป็น "สมองกลฝั่ง Server" ของแอปพลิเคชัน
 *  - รับ request จาก Frontend (React Native / เว็บ)
 *  - ประมวลผล เช่น ตรวจสอบสิทธิ์, ค้นหาข้อมูล, เพิ่ม/แก้ไข/ลบสินค้า
 *  - ติดต่อกับฐานข้อมูล MySQL เพื่ออ่าน/เขียนข้อมูล
 *  - ส่ง response กลับไปให้ Frontend ในรูปแบบ JSON
 *
 *  เทคโนโลยีหลักที่ใช้:
 *    - Express.js   → เว็บเฟรมเวิร์กสำหรับสร้าง REST API
 *    - MySQL2       → ไดร์เวอร์สำหรับเชื่อมต่อฐานข้อมูล MySQL
 *    - JWT          → ระบบยืนยันตัวตนแบบ Token (ไม่ต้องเก็บ session บน server)
 *    - CORS         → อนุญาตให้ Frontend ที่อยู่คนละ domain เรียก API ได้
 * ============================================================================ */


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 1: Import Libraries (นำเข้าไลบรารี่ที่จำเป็น)
 * ──────────────────────────────────────────────────────────────────────────────
 *  require() คือคำสั่งของ Node.js ที่ใช้นำเข้า module/library ภายนอก
 *  แต่ละตัวมีหน้าที่แตกต่างกัน ดังนี้:
 * ────────────────────────────────────────────────────────────────────────────── */

// express: เว็บเฟรมเวิร์กยอดนิยมของ Node.js
// ทำให้เราสร้าง REST API ได้ง่าย เช่น app.get(), app.post(), app.put(), app.delete()
// คิดง่ายๆ ว่า Express คือ "ตัวจัดการเส้นทาง (Router)" ที่รับ HTTP request แล้วส่งกลับ response
const express = require('express');

// cors (Cross-Origin Resource Sharing): ไลบรารี่ที่อนุญาตให้ Frontend
// ที่อยู่คนละ domain/port (เช่น http://localhost:19006) สามารถเรียก API
// ของ server นี้ได้ ถ้าไม่ใส่ cors, browser จะบล็อก request จาก domain อื่น
// ด้วยเหตุผลด้านความปลอดภัย (Same-Origin Policy)
const cors = require('cors');

// mysql2: ไดร์เวอร์สำหรับเชื่อมต่อฐานข้อมูล MySQL จาก Node.js
// ใช้สำหรับส่งคำสั่ง SQL (SELECT, INSERT, UPDATE, DELETE) ไปยังฐานข้อมูล
// mysql2 เป็นเวอร์ชันที่เร็วกว่า mysql ดั้งเดิม และรองรับ Promise/Pool
const mysql = require('mysql2');

// fs (File System): module มาตรฐานของ Node.js สำหรับอ่าน/เขียนไฟล์
// ในที่นี้ใช้อ่านไฟล์ .env เพื่อโหลดค่า environment variables
const fs = require('fs');

// path: module มาตรฐานของ Node.js สำหรับจัดการเส้นทางไฟล์
// ช่วยให้สร้าง path ที่ทำงานได้ทั้ง Windows (ใช้ \) และ Linux/Mac (ใช้ /)
// เช่น path.join(__dirname, '.env') จะสร้าง path ที่ถูกต้องตาม OS ที่ใช้
const path = require('path');


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 2: ตั้งค่า Express Application
 * ──────────────────────────────────────────────────────────────────────────────
 *  สร้าง instance ของ Express แล้วตั้งค่า middleware พื้นฐาน
 *  Middleware คือ "ฟังก์ชันที่ทำงานตรงกลาง" ระหว่าง request กับ response
 *  ทุก request ที่เข้ามาจะผ่าน middleware เหล่านี้ก่อนถึง route handler
 * ────────────────────────────────────────────────────────────────────────────── */

// สร้าง Express application ขึ้นมา 1 ตัว (เปรียบเหมือน "ตัว server" ของเรา)
const app = express();

// เปิดใช้ CORS middleware → ทำให้ทุก domain สามารถเรียก API ของเราได้
// ถ้าไม่ใส่บรรทัดนี้ เวลา Frontend (React Native) เรียก API จะเจอ error
// "Access-Control-Allow-Origin" เพราะ browser บล็อกการเรียกข้าม domain
app.use(cors());

// เปิดใช้ JSON body parser middleware
// ทำให้ Express สามารถอ่านข้อมูล JSON ที่ส่งมาใน request body ได้
// เช่น เวลา Frontend ส่ง POST request พร้อม body { "name": "แว่นตา", "price": 500 }
// Express จะแปลง JSON string เป็น JavaScript object ให้อัตโนมัติ
// แล้วเก็บไว้ใน req.body ให้เราเข้าถึงได้ เช่น req.body.name → "แว่นตา"
app.use(express.json());


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 3: โหลดค่าจากไฟล์ .env (Environment Variables)
 * ──────────────────────────────────────────────────────────────────────────────
 *  ไฟล์ .env เป็นไฟล์ที่เก็บค่าตั้งค่าที่เป็นความลับ เช่น:
 *    - DB_HOST=localhost        (ที่อยู่ฐานข้อมูล)
 *    - DB_USER=root             (ชื่อผู้ใช้ฐานข้อมูล)
 *    - DB_PASSWORD=mypassword   (รหัสผ่านฐานข้อมูล)
 *    - JWT_SECRET=secret_key    (กุญแจลับสำหรับเข้ารหัส JWT)
 *
 *  ทำไมต้องใช้ .env?
 *    - เพื่อไม่ต้อง hardcode ค่าลับลงในโค้ดโดยตรง (ปลอดภัยกว่า)
 *    - เวลา deploy ไป server จริง แค่เปลี่ยนค่าในไฟล์ .env ไม่ต้องแก้โค้ด
 *    - ไฟล์ .env ไม่ควร push ขึ้น git (ใส่ใน .gitignore)
 *
 *  โค้ดส่วนนี้ทำการอ่านไฟล์ .env แบบ manual (ไม่ใช้ library dotenv)
 *  เพื่อให้ทำงานได้ทั้งบน local (XAMPP) และบน VPS server
 * ────────────────────────────────────────────────────────────────────────────── */
try {
  // สร้าง path ไปยังไฟล์ .env โดยใช้ __dirname (โฟลเดอร์ที่ server.js อยู่)
  // เช่น ถ้า server.js อยู่ที่ C:\MyApp\server.js → envPath = C:\MyApp\.env
  const envPath = path.join(__dirname, '.env');

  // ตรวจสอบว่าไฟล์ .env มีอยู่จริงหรือไม่ (fs.existsSync คืนค่า true/false)
  if (fs.existsSync(envPath)) {

    // อ่านเนื้อหาไฟล์ .env ทั้งหมดมาเป็น string (encoding UTF-8)
    const envContent = fs.readFileSync(envPath, 'utf8');

    // แยกเนื้อหาออกเป็นทีละบรรทัด (\r?\n รองรับทั้ง Windows และ Linux)
    // แล้ววนลูปแต่ละบรรทัดเพื่อประมวลผล
    envContent.split(/\r?\n/).forEach(line => {

      // ตัดช่องว่างหน้า-หลังออก
      const trimmed = line.trim();

      // ข้ามบรรทัดว่าง และข้ามบรรทัดที่ขึ้นต้นด้วย # (comment)
      if (trimmed && !trimmed.startsWith('#')) {

        // แยกบรรทัดด้วยเครื่องหมาย = เป็น key และ value
        // เช่น "DB_HOST=localhost" → parts = ["DB_HOST", "localhost"]
        const parts = trimmed.split('=');

        // ตรวจสอบว่ามีทั้ง key และ value (parts.length > 1)
        if (parts.length > 1) {
          // ดึง key (ส่วนซ้ายของ =) แล้วตัดช่องว่าง
          const key = parts[0].trim();

          // ดึง value (ส่วนขวาของ =) → ใช้ slice(1).join('=') เพื่อรองรับ
          // กรณีที่ value มีเครื่องหมาย = อยู่ด้วย (เช่น password=abc=123)
          // แล้วลบเครื่องหมาย quote (', ") ที่ครอบอยู่ออก
          const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');

          // ตั้งค่า environment variable ให้ Node.js
          // หลังจากนี้สามารถเข้าถึงได้ผ่าน process.env.DB_HOST เป็นต้น
          process.env[key] = value;
        }
      }
    });

    // แสดงข้อความยืนยันว่าโหลดไฟล์ .env สำเร็จ
    console.log('.env file loaded successfully.');
  }
} catch (e) {
  // ถ้าเกิด error ระหว่างอ่านไฟล์ .env (เช่น permission denied)
  // จะแสดง error แต่ไม่หยุดทำงาน → server ยังเริ่มได้ตามปกติ
  // โดยจะใช้ค่า default แทน
  console.error('Error loading .env file:', e.message);
}


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 4: ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL (Connection Pool)
 * ──────────────────────────────────────────────────────────────────────────────
 *  Connection Pool คืออะไร?
 *    - แทนที่จะสร้างการเชื่อมต่อ 1 ตัว (createConnection) ที่อาจหลุดได้
 *      Pool จะสร้าง "กลุ่มการเชื่อมต่อ" หลายตัวไว้รอใช้งาน
 *    - เมื่อมี request เข้ามา Pool จะหยิบ connection ที่ว่างมาใช้
 *    - เมื่อใช้เสร็จ connection จะถูกคืนกลับ Pool ไม่ถูกปิดทิ้ง
 *    - ถ้า connection หลุด Pool จะสร้างใหม่ให้อัตโนมัติ (auto-reconnect)
 *
 *  ข้อดีของ Pool:
 *    - รองรับ request พร้อมกันหลายตัว (concurrent requests)
 *    - ไม่ต้องกังวลเรื่อง connection หลุดแล้ว server ล่ม
 *    - มีประสิทธิภาพดีกว่าการสร้าง connection ใหม่ทุกครั้ง
 * ────────────────────────────────────────────────────────────────────────────── */
const db = mysql.createPool({
  // host: ที่อยู่ของ MySQL server
  // ใช้ค่าจาก .env (DB_HOST) ถ้าไม่มีจะใช้ 'localhost' (เครื่องตัวเอง)
  host: process.env.DB_HOST || 'localhost',

  // user: ชื่อผู้ใช้สำหรับ login เข้า MySQL
  // ค่า default คือ 'root' (ผู้ดูแลระบบ MySQL ของ XAMPP)
  user: process.env.DB_USER || 'root',

  // password: รหัสผ่านสำหรับ login เข้า MySQL
  // ค่า default คือ '' (ว่าง) เพราะ XAMPP ปกติไม่ตั้งรหัสผ่าน root
  password: process.env.DB_PASSWORD || '', 

  // database: ชื่อฐานข้อมูลที่จะใช้งาน
  // รองรับทั้ง DB_NAME และ DB_DATABASE (ชื่อ key อาจแตกต่างกันตาม hosting)
  // ค่า default คือ 'ip_std6730202173'
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'ip_std6730202173',

  // port: พอร์ตของ MySQL server (ค่า default ของ MySQL คือ 3306)
  port: process.env.DB_PORT || 3306,

  // waitForConnections: true → ถ้า connection เต็มหมด request ใหม่จะรอในคิว
  // แทนที่จะ error ทันที (เหมือนคิวรอคิวที่ธนาคาร)
  waitForConnections: true,

  // connectionLimit: จำนวน connection สูงสุดที่ Pool จะสร้าง
  // 10 หมายถึงสามารถรับ query พร้อมกันได้สูงสุด 10 ตัว
  connectionLimit: 10,

  // queueLimit: จำนวน request สูงสุดที่รอในคิว
  // 0 = ไม่จำกัด (รอได้ไม่จำกัดจำนวน)
  queueLimit: 0
});

/* ────────────────────────────────────────────────────────────────────────────
 *  ทดสอบการเชื่อมต่อฐานข้อมูลเมื่อ server เริ่มทำงาน
 *  ใช้คำสั่ง SELECT 1 ซึ่งเป็น query ง่ายๆ ที่แค่ตรวจสอบว่า MySQL ตอบรับหรือไม่
 *  ถ้าเชื่อมต่อสำเร็จ → แสดงชื่อ database ที่เชื่อมต่ออยู่
 *  ถ้าเชื่อมต่อไม่ได้ → แสดง warning แต่ server จะยังเริ่มทำงาน
 *  เพราะ Pool จะพยายามเชื่อมต่อใหม่อัตโนมัติเมื่อ MySQL พร้อม
 * ──────────────────────────────────────────────────────────────────────────── */
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('Warning: MySQL not connected yet. Will auto-retry when MySQL starts.');
  } else {
    console.log(`Connected to MySQL database: ${process.env.DB_NAME || process.env.DB_DATABASE || 'ip_std6730202173'}`);
  }
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 5: ตั้งค่า JWT (JSON Web Token)
 * ──────────────────────────────────────────────────────────────────────────────
 *  JWT คืออะไร?
 *    JWT (JSON Web Token) คือมาตรฐานสำหรับยืนยันตัวตนแบบ "ไม่ต้องเก็บ session"
 *    แทนที่ server จะจำว่า user คนไหน login อยู่ (session-based)
 *    JWT จะสร้าง "โทเค็น" (token) ส่งให้ user เก็บไว้ฝั่ง Frontend
 *
 *  JWT ทำงานยังไง?
 *    1. User ส่ง username/password มาที่ server
 *    2. Server ตรวจสอบว่าถูกต้อง → สร้าง JWT Token แล้วส่งกลับ
 *    3. Frontend เก็บ token ไว้ (เช่น AsyncStorage)
 *    4. เวลาเรียก API ที่ต้อง login, Frontend ส่ง token มาใน header
 *    5. Server ตรวจสอบ token → ถ้าถูกต้องก็อนุญาตให้เข้าถึง
 *
 *  โครงสร้างของ JWT Token ประกอบด้วย 3 ส่วน คั่นด้วยจุด (.):
 *    xxxxx.yyyyy.zzzzz
 *    ส่วนที่ 1 (Header):  ระบุประเภท token และ algorithm ที่ใช้เข้ารหัส
 *    ส่วนที่ 2 (Payload): ข้อมูลที่ฝังไว้ เช่น user id, username, role, เวลาหมดอายุ
 *    ส่วนที่ 3 (Signature): ลายเซ็นดิจิทัล สร้างจาก Header + Payload + Secret Key
 *                            ใช้ตรวจสอบว่า token ไม่ถูกแก้ไข
 *
 *  JWT_SECRET คือ "กุญแจลับ" ที่ใช้เข้ารหัสและถอดรหัส token
 *  ถ้าใครรู้ JWT_SECRET ก็สามารถปลอม token ได้ → ต้องเก็บเป็นความลับ!
 * ────────────────────────────────────────────────────────────────────────────── */

// นำเข้า jsonwebtoken library สำหรับสร้างและตรวจสอบ JWT Token
const jwt = require('jsonwebtoken');

// ดึงค่า JWT_SECRET จาก .env ถ้าไม่มีจะใช้ค่า default
// ⚠️ ในระบบจริง ควรใช้ค่าที่ซับซ้อนและเก็บไว้ใน .env เท่านั้น
const JWT_SECRET = process.env.JWT_SECRET || 'ming_optic_secret_key';


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 6: Middleware Functions (ฟังก์ชันตัวกลาง)
 * ──────────────────────────────────────────────────────────────────────────────
 *  Middleware คือฟังก์ชันที่ทำงาน "ก่อน" route handler จริง
 *  ใช้สำหรับตรวจสอบเงื่อนไขก่อนอนุญาตให้เข้าถึง API
 *  ถ้าผ่านการตรวจสอบ → เรียก next() เพื่อส่งต่อไปยัง handler ถัดไป
 *  ถ้าไม่ผ่าน → ส่ง error response กลับทันที (ไม่เรียก next())
 *
 *  การทำงานเป็นลูกโซ่:
 *    Request → [Middleware 1] → [Middleware 2] → [Route Handler] → Response
 *    ถ้า Middleware 1 ส่ง error กลับ → Middleware 2 และ Route Handler จะไม่ถูกเรียก
 * ────────────────────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────────────────
 *  authenticateToken: Middleware สำหรับตรวจสอบ JWT Token
 * ────────────────────────────────────────────────────────────────────────────
 *  ทำงานยังไง:
 *    1. ดึง Authorization header จาก request
 *       header จะมีรูปแบบ: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *    2. แยกเอาเฉพาะ token (ส่วนหลัง "Bearer ")
 *    3. ถ้าไม่มี token → ส่ง 401 Unauthorized กลับ
 *    4. ตรวจสอบ token ด้วย jwt.verify() + JWT_SECRET
 *       - ถ้า token ถูกต้องและยังไม่หมดอายุ → ถอดรหัสได้ข้อมูล user
 *         แล้วเก็บไว้ใน req.user เพื่อให้ handler ถัดไปใช้ได้
 *       - ถ้า token ไม่ถูกต้อง/หมดอายุ → ส่ง 403 Forbidden กลับ
 * ──────────────────────────────────────────────────────────────────────────── */
const authenticateToken = (req, res, next) => {
  // ดึง Authorization header จาก request
  // ตัวอย่าง: authHeader = "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers['authorization'];

  // แยกเอาเฉพาะ token ด้วย split(' ')[1]
  // "Bearer eyJhbG..." → ["Bearer", "eyJhbG..."] → เอา index [1] = "eyJhbG..."
  // ถ้า authHeader เป็น undefined จะได้ token = undefined (ใช้ && ป้องกัน error)
  const token = authHeader && authHeader.split(' ')[1];

  // ถ้าไม่มี token → ส่ง HTTP 401 (Unauthorized) กลับ
  // หมายความว่า user ไม่ได้ส่ง token มา (ยังไม่ได้ login)
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided.' });
  }

  // ตรวจสอบ token ว่าถูกต้องหรือไม่ โดยใช้ JWT_SECRET ถอดรหัส
  // jwt.verify() จะตรวจสอบ:
  //   - ลายเซ็นดิจิทัล (signature) ตรงกับ SECRET หรือไม่
  //   - token หมดอายุแล้วหรือยัง (ตรวจจาก expiresIn ที่ตั้งไว้ตอนสร้าง)
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // token ไม่ถูกต้องหรือหมดอายุ → ส่ง HTTP 403 (Forbidden)
      return res.status(403).json({ success: false, error: 'Forbidden: Invalid token.' });
    }

    // token ถูกต้อง! decoded จะเป็น object ที่มีข้อมูลที่ฝังไว้ตอนสร้าง token
    // เช่น { id: 1, username: "admin", role: "admin", iat: 1234567890, exp: 1234575090 }
    // เก็บไว้ใน req.user เพื่อให้ handler ถัดไปเข้าถึงข้อมูล user ได้
    req.user = decoded;

    // เรียก next() เพื่อส่งต่อไปยัง middleware/handler ถัดไปในลูกโซ่
    next();
  });
};

/* ────────────────────────────────────────────────────────────────────────────
 *  requireAdmin: Middleware สำหรับตรวจสอบสิทธิ์ Admin
 * ────────────────────────────────────────────────────────────────────────────
 *  ทำงานยังไง:
 *    - ใช้ร่วมกับ authenticateToken (ต้องผ่าน authenticateToken ก่อน)
 *    - ตรวจสอบว่า req.user.role === 'admin' หรือไม่
 *    - ถ้าเป็น admin → อนุญาตให้ผ่าน (เรียก next())
 *    - ถ้าไม่ใช่ admin → ส่ง 403 Forbidden กลับ
 *
 *  ใช้เมื่อไร:
 *    - ใช้กับ API ที่ต้องการจำกัดสิทธิ์เฉพาะผู้ดูแลระบบ เช่น ลบสินค้า
 *    - ตัวอย่างการใช้: app.delete('/api/products/:id', authenticateToken, requireAdmin, handler)
 *      แปลว่า request ต้องผ่านทั้ง 2 ด่าน (มี token + เป็น admin) ถึงจะลบได้
 * ──────────────────────────────────────────────────────────────────────────── */
const requireAdmin = (req, res, next) => {
  // ตรวจสอบว่า req.user มีข้อมูล (ผ่าน authenticateToken แล้ว)
  // และ role เป็น 'admin' หรือไม่
  if (req.user && req.user.role === 'admin') {
    // เป็น admin → อนุญาตให้ผ่าน
    next();
  } else {
    // ไม่ใช่ admin → ส่ง HTTP 403 (Forbidden) กลับ
    res.status(403).json({ success: false, error: 'Forbidden: Admins only.' });
  }
};


/* ══════════════════════════════════════════════════════════════════════════════
 *  ส่วนที่ 7: API Endpoints (เส้นทาง API ทั้งหมด)
 * ══════════════════════════════════════════════════════════════════════════════
 *  API Endpoint คือ URL ที่ Frontend เรียกมาเพื่อทำงานต่างๆ
 *  แต่ละ endpoint มี:
 *    - HTTP Method (GET/POST/PUT/DELETE) → บอกว่าจะทำอะไร
 *    - URL Path (เช่น /api/products)   → บอกว่าจะทำกับ resource ไหน
 *    - Handler Function                → ฟังก์ชันที่ทำงานจริง
 *
 *  ภาพรวม API ทั้งหมด:
 *  ┌──────────────────────────────────────────────────────────────────────┐
 *  │ Method │ Endpoint              │ Auth     │ หน้าที่               │
 *  ├────────┼───────────────────────┼──────────┼───────────────────────┤
 *  │ POST   │ /api/login            │ ไม่ต้อง   │ เข้าสู่ระบบ            │
 *  │ GET    │ /api/products         │ ไม่ต้อง   │ ดึงข้อมูล/ค้นหาสินค้า  │
 *  │ POST   │ /api/products         │ ไม่ต้อง   │ เพิ่มสินค้าใหม่         │
 *  │ PUT    │ /api/products/:id     │ ไม่ต้อง   │ แก้ไขสินค้า            │
 *  │ DELETE │ /api/products/:id     │ Admin    │ ลบสินค้า              │
 *  └──────────────────────────────────────────────────────────────────────┘
 * ══════════════════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────────────────────────
 *  API ที่ 1: ระบบเข้าสู่ระบบ (Login)
 *  Method: POST
 *  URL:    /api/login
 *  Auth:   ไม่ต้อง (เพราะยังไม่มี token)
 * ──────────────────────────────────────────────────────────────────────────────
 *  รับอะไร (Request Body - JSON):
 *    {
 *      "username": "admin",    ← ชื่อผู้ใช้
 *      "password": "1234"      ← รหัสผ่าน
 *    }
 *
 *  ทำอะไร:
 *    1. ค้นหา username + password ในตาราง 'users' (สำหรับ XAMPP local)
 *    2. ถ้าไม่เจอ → ค้นหาในตาราง 'admins' (สำหรับ VPS server)
 *       (รองรับ 2 ตาราง เพราะชื่อตารางอาจต่างกันระหว่าง local กับ VPS)
 *    3. ถ้าเจอ → สร้าง JWT Token (หมดอายุใน 2 ชั่วโมง) แล้วส่งกลับ
 *    4. ถ้าไม่เจอเลย → ส่ง error "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
 *
 *  คืนอะไร (Response - JSON):
 *    สำเร็จ: { success: true, message: "เข้าสู่ระบบสำเร็จ", token: "eyJhbG..." }
 *    ล้มเหลว: { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
 *
 *  ⚠️ หมายเหตุด้านความปลอดภัย:
 *    - โค้ดนี้เก็บ password แบบ plain text (ไม่เข้ารหัส)
 *    - ในระบบจริงควรใช้ bcrypt เข้ารหัส password
 * ────────────────────────────────────────────────────────────────────────────── */
app.post('/api/login', (req, res) => {
  // ดึง username และ password จาก request body (ข้อมูลที่ Frontend ส่งมา)
  // ใช้ destructuring: { username, password } = req.body
  const { username, password } = req.body;

  // สร้างคำสั่ง SQL สำหรับค้นหาจากตาราง 'users' (XAMPP local)
  // ใช้ ? เป็น placeholder เพื่อป้องกัน SQL Injection
  // SQL Injection คือการโจมตีด้วยการแทรกคำสั่ง SQL ผ่าน input
  // เช่น ถ้าใช้ string concatenation: "SELECT * FROM users WHERE username = '" + username + "'"
  // ผู้โจมตีอาจใส่ username = "' OR 1=1 --" ทำให้ login ได้โดยไม่ต้องรู้รหัสผ่าน
  // การใช้ ? placeholder จะป้องกันปัญหานี้ได้
  const sql1 = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  // ส่งคำสั่ง SQL ไปยัง MySQL พร้อม parameter [username, password]
  // ค่าใน array จะถูกแทนที่ ? ตามลำดับ
  db.query(sql1, [username, password], (err1, results1) => {
    // ถ้าไม่มี error (!err1) และพบผลลัพธ์ (results1.length > 0)
    // แสดงว่าเจอ user ในตาราง 'users' → login สำเร็จ
    if (!err1 && results1 && results1.length > 0) {
      // ดึงข้อมูล user แถวแรกที่เจอ
      const user = results1[0];

      // สร้าง JWT Token โดยฝังข้อมูล user ไว้ข้างใน (payload)
      // jwt.sign(payload, secret, options) → คืน token string
      const token = jwt.sign(
        // Payload: ข้อมูลที่จะฝังใน token (ห้ามใส่ข้อมูลลับ เช่น password)
        { id: user.id, username: user.username, role: 'admin' },
        // Secret Key: กุญแจลับสำหรับเข้ารหัส
        JWT_SECRET,
        // Options: ตั้งให้ token หมดอายุใน 2 ชั่วโมง
        // หลังจาก 2 ชั่วโมง token จะใช้ไม่ได้ ต้อง login ใหม่
        { expiresIn: '2h' }
      );

      // ส่ง response กลับพร้อม token ให้ Frontend เก็บไว้ใช้
      return res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', token });
    }

    // ────────────────────────────────────────────────────────────
    // ถ้าไม่เจอในตาราง 'users' → ลองค้นหาจากตาราง 'admins' (VPS)
    // รองรับกรณีที่ฐานข้อมูลบน VPS ใช้ชื่อตารางว่า 'admins' แทน 'users'
    // ────────────────────────────────────────────────────────────
    const sql2 = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    db.query(sql2, [username, password], (err2, results2) => {
      // ถ้า query ตาราง admins เกิด error → ส่ง 500 (Internal Server Error) กลับ
      if (err2) {
        console.error('Login error:', err2);
        return res.status(500).json({ success: false, error: 'Database error' });
      }

      // ถ้าเจอ user ในตาราง 'admins' → login สำเร็จ สร้าง token เช่นเดียวกัน
      if (results2 && results2.length > 0) {
        const user = results2[0];
        const token = jwt.sign(
          { id: user.id, username: user.username, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', token });
      } else {
        // ไม่เจอทั้ง 2 ตาราง → username หรือ password ไม่ถูกต้อง
        // ส่ง HTTP 401 (Unauthorized) กลับ
        res.status(401).json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      }
    });
  });
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  API ที่ 2: ดึงข้อมูลสินค้าทั้งหมด + ค้นหา (Search)
 *  Method: GET
 *  URL:    /api/products
 *  Auth:   ไม่ต้อง (ใครก็ดูรายการสินค้าได้)
 * ──────────────────────────────────────────────────────────────────────────────
 *  รับอะไร (Query Parameters - ต่อท้าย URL):
 *    ?q=แว่น       หรือ ?search=แว่น  ← คำค้นหา (ถ้าไม่ส่ง = ดึงทั้งหมด)
 *    ?page=1       ← หน้าที่ต้องการ (สำหรับ pagination, ค่า default = 1)
 *    ?limit=20     ← จำนวนรายการต่อหน้า (ค่า default = 999 = เกือบทั้งหมด)
 *
 *  ตัวอย่างการเรียก:
 *    GET /api/products                → ดึงสินค้าทั้งหมด
 *    GET /api/products?q=แว่น          → ค้นหาสินค้าที่ชื่อมี "แว่น"
 *    GET /api/products?page=2&limit=10 → ดึงหน้าที่ 2, หน้าละ 10 รายการ
 *
 *  ทำอะไร:
 *    1. รับ query parameters (q, page, limit)
 *    2. สร้างคำสั่ง SQL SELECT พร้อม WHERE (ถ้ามีคำค้น) และ LIMIT/OFFSET
 *    3. ส่ง query ไป MySQL
 *    4. ถ้า column 'name' ไม่มี (บาง VPS ใช้ 'productname') → ลอง fallback query
 *
 *  คืนอะไร (Response - JSON):
 *    สำเร็จ: [ { id, name, stock, price, image }, { ... }, ... ]  ← array ของสินค้า
 *    ล้มเหลว: { error: "error message" }
 * ────────────────────────────────────────────────────────────────────────────── */
app.get('/api/products', (req, res) => {
  // ดึงค่า query parameter 'q' หรือ 'search' (คำค้นหา)
  // ถ้าไม่ส่งมาจะได้ค่าว่าง '' (แสดงทั้งหมด)
  const q = req.query.q || req.query.search || '';

  // ดึงค่า page (หน้าที่ต้องการ) แปลงเป็นจำนวนเต็ม
  // parseInt() แปลง string เป็น number, || 1 คือค่า default ถ้าแปลงไม่ได้
  const page = parseInt(req.query.page) || 1;

  // ดึงค่า limit (จำนวนรายการต่อหน้า) ค่า default = 999 (แสดงเกือบทั้งหมด)
  const limit = parseInt(req.query.limit) || 999;

  // คำนวณ offset สำหรับ pagination
  // offset = จำนวนรายการที่ต้องข้าม
  // เช่น page=1, limit=10 → offset=0 (ไม่ข้าม เริ่มจากรายการแรก)
  //       page=2, limit=10 → offset=10 (ข้าม 10 รายการแรก)
  //       page=3, limit=10 → offset=20 (ข้าม 20 รายการแรก)
  const offset = (page - 1) * limit;

  // เริ่มสร้างคำสั่ง SQL SELECT (ดึงข้อมูลทั้งหมดจากตาราง products)
  let sql = 'SELECT * FROM products';
  let queryParams = [];

  // ถ้ามีคำค้นหา (q ไม่ใช่ค่าว่าง) → เพิ่ม WHERE เพื่อกรองผลลัพธ์
  if (q) {
    // ใช้ LIKE ? เพื่อค้นหาแบบ "มีคำนี้อยู่ในชื่อ" (partial match)
    // %${q}% หมายถึง "อะไรก็ได้" + คำค้น + "อะไรก็ได้"
    // เช่น %แว่น% จะเจอ "แว่นตากันแดด", "แว่นสายตา", "ขายแว่น"
    // ค้นหาทั้งจากชื่อ (name) และรหัสสินค้า (id)
    sql += ' WHERE (name LIKE ? OR id LIKE ?)';
    queryParams.push(`%${q}%`, `%${q}%`);
  }

  // เพิ่ม LIMIT และ OFFSET สำหรับ pagination
  // LIMIT ? → จำนวนรายการที่ต้องการ
  // OFFSET ? → จำนวนรายการที่ต้องข้าม
  sql += ' LIMIT ? OFFSET ?';
  const actualParams = [...queryParams, limit, offset];

  // ส่งคำสั่ง SQL ไปยัง MySQL
  db.query(sql, actualParams, (err, results) => {
    if (err) {
      // ────────────────────────────────────────────────────────
      // Fallback: ถ้า column 'name' ไม่มี (error)
      // อาจเป็นเพราะบาง VPS ใช้ชื่อ column ว่า 'productname' แทน 'name'
      // → ลองสร้าง query ใหม่โดยใช้ 'productname' แทน
      // ────────────────────────────────────────────────────────
      console.error('Search error, trying fallback:', err.message);
      let fallbackSql = 'SELECT * FROM products';
      let fallbackParams = [];
      if (q) {
        fallbackSql += ' WHERE (productname LIKE ? OR id LIKE ?)';
        fallbackParams.push(`%${q}%`, `%${q}%`);
      }
      fallbackSql += ' LIMIT ? OFFSET ?';
      db.query(fallbackSql, [...fallbackParams, limit, offset], (err2, results2) => {
        if (err2) {
          // fallback ก็ error อีก → ส่ง 500 กลับ
          return res.status(500).json({ error: err2.message });
        }
        // fallback สำเร็จ → ส่งผลลัพธ์กลับ (ถ้า null ส่ง array ว่าง)
        res.json(results2 || []);
      });
      return;
    }

    // query สำเร็จ → ส่งผลลัพธ์เป็น JSON array กลับไปให้ Frontend
    // ถ้า results เป็น null จะส่ง [] (array ว่าง) แทน
    res.json(results || []);
  });
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  API ที่ 3: เพิ่มสินค้าใหม่ (Add Product)
 *  Method: POST
 *  URL:    /api/products
 *  Auth:   ไม่ต้อง
 * ──────────────────────────────────────────────────────────────────────────────
 *  รับอะไร (Request Body - JSON):
 *    {
 *      "id":    "P001",                ← รหัสสินค้า (ต้องไม่ซ้ำ)
 *      "name":  "แว่นตากันแดด",          ← ชื่อสินค้า
 *      "stock": 50,                    ← จำนวนสินค้าในสต็อก
 *      "price": 1500,                  ← ราคาสินค้า
 *      "image": "https://example.com/img.jpg" ← URL รูปภาพสินค้า
 *    }
 *
 *  ทำอะไร:
 *    1. ตรวจสอบว่าส่งข้อมูลครบทุกช่องหรือไม่ (id, name, stock, price, image)
 *    2. ถ้าไม่ครบ → ส่ง 400 (Bad Request) กลับ
 *    3. ถ้าครบ → INSERT ข้อมูลลงตาราง products
 *    4. ถ้า id ซ้ำ → ส่ง 409 (Conflict) กลับ
 *    5. ถ้าสำเร็จ → ส่งข้อความยืนยันกลับ
 *
 *  คืนอะไร (Response - JSON):
 *    สำเร็จ:    { success: true, message: "Product added successfully!" }
 *    ข้อมูลไม่ครบ: { success: false, error: "All fields are required." }
 *    id ซ้ำ:    { success: false, error: 'Product ID "P001" already exists...' }
 *    DB error:  { success: false, error: "Database error: ..." }
 * ────────────────────────────────────────────────────────────────────────────── */
app.post('/api/products', (req, res) => {
  // ไม่บังคับให้ส่ง id มาแล้ว เพราะเราจะสร้างให้เอง
  const { name, stock, price, image } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น (ยกเว้น id)
  if (!name || !stock || !price || !image) {
    return res.status(400).json({ success: false, error: 'All fields (name, stock, price, image) are required.' });
  }

  // ค้นหารหัสสินค้าล่าสุดที่ขึ้นต้นด้วย 'P' เพื่อรันเลขอัตโนมัติ (เช่น P001, P002)
  const getLastIdSql = 'SELECT id FROM products WHERE id LIKE "P%" ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC LIMIT 1';
  
  db.query(getLastIdSql, (err1, results1) => {
    if (err1) {
      return res.status(500).json({ success: false, error: 'Database error when generating ID: ' + err1.message });
    }

    let newId = 'P000'; // ค่าเริ่มต้นถ้ายังไม่มีสินค้าเลย
    if (results1.length > 0) {
      const lastId = results1[0].id; // เช่น "P005"
      const lastNum = parseInt(lastId.substring(1), 10); // ได้ 5
      if (!isNaN(lastNum)) {
        newId = 'P' + String(lastNum + 1).padStart(3, '0'); // เปลี่ยนเป็น "P006"
      }
    }

    // กรณี Frontend ยังส่ง id มาให้ (แบบเก่า) ให้ใช้ id ของเราที่สร้างใหม่แทน
    const finalId = newId;

    const sql = 'INSERT INTO products (id, name, stock, price, image) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [finalId, name, stock, price, image], (err2, results2) => {
      if (err2) {
        console.error('Insert error:', err2.message);
        if (err2.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, error: `Product ID "${finalId}" already exists.` });
        }
        return res.status(500).json({ success: false, error: 'Database error: ' + err2.message });
      }
      res.json({ success: true, message: 'Product added successfully!', id: finalId });
    });
  });
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  API ที่ 4: แก้ไขข้อมูลสินค้า (Edit/Update Product)
 *  Method: PUT
 *  URL:    /api/products/:id
 *  Auth:   ไม่ต้อง
 * ──────────────────────────────────────────────────────────────────────────────
 *  :id คือ URL Parameter → ค่าที่ใส่แทน :id จะถูกเก็บใน req.params.id
 *  ตัวอย่าง: PUT /api/products/P001 → req.params.id = "P001"
 *
 *  รับอะไร:
 *    URL Parameter: :id ← รหัสสินค้าที่ต้องการแก้ไข
 *    Request Body (JSON):
 *    {
 *      "name":  "แว่นตากันแดด รุ่นใหม่",  ← ชื่อสินค้าใหม่
 *      "stock": 100,                     ← จำนวนสต็อกใหม่
 *      "price": 1800,                    ← ราคาใหม่
 *      "image": "https://example.com/new.jpg" ← URL รูปภาพใหม่
 *    }
 *
 *  ทำอะไร:
 *    1. ดึง productId จาก URL parameter
 *    2. ดึง name, stock, price, image จาก request body
 *    3. ตรวจสอบว่าข้อมูลครบหรือไม่
 *    4. ส่ง UPDATE query ไป MySQL เพื่ออัพเดทข้อมูลที่ id ตรงกัน
 *
 *  คืนอะไร (Response - JSON):
 *    สำเร็จ:      { success: true, message: "แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว" }
 *    ข้อมูลไม่ครบ:  { success: false, error: "All fields are required." }
 *    DB error:    { error: "error message" }
 * ────────────────────────────────────────────────────────────────────────────── */
app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  // ดึง productId จาก URL parameter (:id)
  // เช่น PUT /api/products/P001 → productId = "P001"
  const productId = req.params.id;

  // ดึงข้อมูลที่ต้องการแก้ไขจาก request body
  const { name, stock, price, image } = req.body;

  // ตรวจสอบว่าข้อมูลที่จำเป็นส่งมาครบหรือไม่
  if (!name || !price || !image) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // สร้างคำสั่ง SQL UPDATE เพื่อแก้ไขข้อมูลสินค้า
  // SET name = ?, stock = ?, ... → กำหนดค่าใหม่ให้แต่ละ column
  // WHERE id = ? → แก้ไขเฉพาะแถวที่ id ตรงกัน
  const sql = 'UPDATE products SET name = ?, stock = ?, price = ?, image = ? WHERE id = ?';
  
  // ส่งคำสั่ง SQL ไป MySQL
  // parameter ตัวสุดท้าย (productId) ใช้สำหรับ WHERE id = ?
  db.query(sql, [name, stock, price, image, productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // UPDATE สำเร็จ → ส่งข้อความยืนยันกลับ
    res.json({ success: true, message: 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว' });
  });
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  API ที่ 5: ลบสินค้า (Delete Product)
 *  Method: DELETE
 *  URL:    /api/products/:id
 *  Auth:   ต้อง Login + เป็น Admin เท่านั้น ⚠️
 * ──────────────────────────────────────────────────────────────────────────────
 *  🔒 API นี้มีการป้องกันด้วย 2 middleware:
 *     1. authenticateToken → ตรวจสอบว่ามี JWT Token ที่ถูกต้อง
 *     2. requireAdmin     → ตรวจสอบว่า role เป็น 'admin'
 *     ถ้าไม่ผ่านด่านใดด่านหนึ่ง request จะถูกปฏิเสธทันที
 *
 *  ลำดับการทำงาน:
 *     Request → [authenticateToken] → [requireAdmin] → [Handler] → Response
 *     ถ้าไม่มี token → 401 Unauthorized (หยุดที่ authenticateToken)
 *     ถ้า token ผิด  → 403 Forbidden (หยุดที่ authenticateToken)
 *     ถ้าไม่ใช่ admin → 403 Forbidden (หยุดที่ requireAdmin)
 *     ถ้าผ่านทั้ง 2 ด่าน → ลบสินค้า
 *
 *  รับอะไร:
 *    URL Parameter: :id ← รหัสสินค้าที่ต้องการลบ
 *    Header: Authorization: Bearer <JWT_TOKEN>  ← ต้องส่ง token
 *
 *  ทำอะไร:
 *    1. (authenticateToken) ตรวจสอบ JWT Token
 *    2. (requireAdmin) ตรวจสอบสิทธิ์ Admin
 *    3. ส่ง DELETE query ไป MySQL เพื่อลบสินค้าที่ id ตรงกัน
 *    4. ตรวจสอบ affectedRows → ถ้าเป็น 0 แสดงว่าไม่มีสินค้า id นั้น
 *
 *  คืนอะไร (Response - JSON):
 *    สำเร็จ:        { success: true, message: "Product deleted successfully!" }
 *    ไม่เจอสินค้า:   { success: false, error: 'Product with ID "P001" not found.' }
 *    ไม่มี token:   { success: false, error: "Unauthorized: No token provided." }
 *    ไม่ใช่ admin:  { success: false, error: "Forbidden: Admins only." }
 *    DB error:      { success: false, error: "Database error: ..." }
 * ────────────────────────────────────────────────────────────────────────────── */
app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  // ดึง productId จาก URL parameter
  const productId = req.params.id;

  // สร้างคำสั่ง SQL DELETE เพื่อลบสินค้า
  // WHERE id = ? → ลบเฉพาะแถวที่ id ตรงกับ productId
  const sql = 'DELETE FROM products WHERE id = ?';
  
  // ส่งคำสั่ง SQL ไป MySQL
  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
    }

    // ตรวจสอบจำนวนแถวที่ถูกลบ (affectedRows)
    // ถ้าเป็น 0 → ไม่มีสินค้า id นั้นในฐานข้อมูล
    if (results.affectedRows === 0) {
      // ส่ง HTTP 404 (Not Found) → แจ้งว่าไม่เจอสินค้า
      return res.status(404).json({ success: false, error: `Product with ID "${productId}" not found.` });
    }

    // ลบสำเร็จ (affectedRows >= 1) → ส่งข้อความยืนยันกลับ
    res.json({ success: true, message: 'Product deleted successfully!' });
  });
});


/* ──────────────────────────────────────────────────────────────────────────────
 *  ส่วนที่ 8: เริ่มต้น Server (Listen)
 * ──────────────────────────────────────────────────────────────────────────────
 *  app.listen() จะเริ่มต้น HTTP server และรอรับ request จาก client
 *
 *  PORT คือหมายเลข port ที่ server จะ "ฟัง" (listen) request
 *    - ดึงค่าจาก environment variable PORT (ถ้ามี)
 *    - ถ้าไม่มีจะใช้ port 3000 เป็นค่า default
 *    - port เปรียบเหมือน "ประตู" ของ server
 *      เช่น port 3000 → Frontend ต้องเรียก http://localhost:3000/api/...
 *
 *  เมื่อ server เริ่มทำงานสำเร็จ จะแสดงข้อความ:
 *    "Server is running on port 3000"
 *  หลังจากนี้ server พร้อมรับ request จาก Frontend แล้ว
 * ────────────────────────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});