const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// โหลดข้อมูลจากไฟล์ .env (ถ้ามี) แบบ Manual เพื่อให้ใช้ได้ทั้งบน Local และ Server
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length > 1) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
          process.env[key] = value;
        }
      }
    });
    console.log('.env file loaded successfully.');
  }
} catch (e) {
  console.error('Error loading .env file:', e.message);
}

// ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'ip_std6730202173',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log(`Connected to MySQL database: ${process.env.DB_NAME || process.env.DB_DATABASE || 'ip_std6730202173'}`);
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ming_optic_secret_key';

// Middleware สำหรับแกะ JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Forbidden: Invalid token.' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware สำหรับตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Forbidden: Admins only.' });
  }
};

// 1. ระบบ Login (POST /api/login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (results.length > 0) {
      const user = results[0];
      // สร้าง JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', token });
    } else {
      res.status(401).json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  });
});

// 2. ระบบดึงข้อมูลทั้งหมด & ค้นหา Search (GET /api/products)
app.get('/api/products', (req, res) => {
  const q = req.query.q || req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 999;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM products';
  let queryParams = [];

  if (q) {
    sql += ' WHERE name LIKE ?';
    queryParams.push(`%${q}%`);
  }

  sql += ' LIMIT ? OFFSET ?';
  const actualParams = [...queryParams, limit, offset];

  db.query(sql, actualParams, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 3. ระบบเพิ่มข้อมูล Add (POST /api/products)
app.post('/api/products', (req, res) => {
  const { id, name, stock, price, image } = req.body;

  if (!id || !name || !stock || !price || !image) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO products (id, name, stock, price, image) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [id, name, stock, price, image], (err, results) => {
    if (err) {
      console.error('Insert error:', err.message);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, error: `Product ID "${id}" already exists. Please use a different ID.` });
      }
      return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
    }
    res.json({ success: true, message: 'Product added successfully!' });
  });
});

// 4. ระบบแก้ไขข้อมูล Edit (PUT /api/products/:id)
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, stock, price, image } = req.body;
  const sql = 'UPDATE products SET name = ?, stock = ?, price = ?, image = ? WHERE id = ?';
  
  db.query(sql, [name, stock, price, image, productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว' });
  });
});

// 5. ระบบลบข้อมูล Delete (DELETE /api/products/:id) - จำกัดเฉพาะ Admin ผ่าน JWT
app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE id = ?';
  
  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, error: `Product with ID "${productId}" not found.` });
    }
    res.json({ success: true, message: 'Product deleted successfully!' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
