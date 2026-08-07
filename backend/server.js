const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());

// ตั้งค่าเชื่อมต่อฐานข้อมูลในเครื่องตัวเอง (localhost)
const pool = mysql.createPool({
  host: 'localhost',      
  user: 'root',           
  password: '',           
  database: 'ip_std6730202173', 
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00"
});

const PRODUCTS_TABLE = 'products'; 

function isUnknownColumn(err) {
  return err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054);
}

// ทดสอบการเชื่อมต่อตอนเปิดเซิร์ฟเวอร์
(async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL Database successfully!');
    conn.release();
  } catch (err) {
    console.error('MySQL Connection Failed:', err);
    process.exit(1);
  }
})();

// ==========================================
// API สำหรับเข้าสู่ระบบ (Login)
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // เช็ก Username และ Password
    // รหัสผ่านคือ 12345678 (ตอนกรอกในหน้าเว็บต้องกรอกให้ตรงกันนะครับ)
    if (username === 'Nichakamon' && password === '@Ming2005') { 
        return res.json({ success: true });
    } else {
        return res.json({ success: false }); // รหัสผิด
    }
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// API เพิ่มสินค้าใหม่
// ==========================================
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body || {};
    const { id, name, stock = 0, category = null, location_text = null, badge_status = null, image_url = null, product_link = null } = body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing id or name' });
    }

    const sqlwithlink = `INSERT INTO ${PRODUCTS_TABLE} (Productcode, Name, Stock, Category, Location, Status, image, ProductLink, Lastupdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const sqlLegacy = `INSERT INTO ${PRODUCTS_TABLE} (Productcode, Name, Stock, Category, Location, Status, image, Lastupdate) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

    const paramsWithLink = [id, name, Number(stock) || 0, category, location_text, badge_status, image_url, product_link];
    const paramsLegacy = [id, name, Number(stock) || 0, category, location_text, badge_status, image_url];

    let result;
    try {
      [result] = await pool.query(sqlwithlink, paramsWithLink);
    } catch (insertErr) {
      if (!isUnknownColumn(insertErr)) throw insertErr;
      [result] = await pool.query(sqlLegacy, paramsLegacy);
    }

    return res.status(201).json({ success: true, productId: result.insertId });
  } catch (err) {
    console.error("Add Product Error:", err);
    return res.status(500).json({ error: 'Failed to add product' });
  }
});

// ==========================================
// API อัปเดตข้อมูลสินค้า
// ==========================================
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { name, stock, category = null, location_text = null, badge_status = null, image_url = null, product_link = null } = body;

    if (!name) return res.status(400).json({ error: "Missing name" });

    const sqlwithlink = `UPDATE ${PRODUCTS_TABLE} SET Name = ?, Stock = ?, Category = ?, Location = ?, Status = ?, image = ?, ProductLink = ?, Lastupdate = NOW() WHERE Productcode = ?`;
    const sqlLegacy = `UPDATE ${PRODUCTS_TABLE} SET Name = ?, Stock = ?, Category = ?, Location = ?, Status = ?, image = ?, Lastupdate = NOW() WHERE Productcode = ?`;

    const paramsWithLink = [name, Number(stock) || 0, category, location_text, badge_status, image_url, product_link, id];
    const paramsLegacy = [name, Number(stock) || 0, category, location_text, badge_status, image_url, id];

    let result;
    try {
      [result] = await pool.query(sqlwithlink, paramsWithLink);
    } catch (updateErr) {
      if (!isUnknownColumn(updateErr)) throw updateErr;
      [result] = await pool.query(sqlLegacy, paramsLegacy);
    }

    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error('Update Product Error:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});