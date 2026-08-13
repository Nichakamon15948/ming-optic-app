const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Load env
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
  }
} catch (e) {
  console.error('Error loading .env file:', e.message);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'ip_std6730202173',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  
  console.log('--- DATABASE STRUCTURE INFO ---');
  db.query('DESCRIBE products', (err, results) => {
    if (err) {
      console.error('Error describing products table:', err);
    } else {
      console.log('Table schema of "products":');
      console.log(results.map(row => `- Field: [${row.Field}], Type: [${row.Type}], Null: [${row.Null}]`).join('\n'));
    }
    
    db.query('SELECT * FROM products LIMIT 1', (err, rows) => {
      if (err) {
        console.error('Error selecting row:', err);
      } else if (rows.length > 0) {
        console.log('\nExample row keys and values:');
        console.log(JSON.stringify(rows[0], null, 2));
      } else {
        console.log('\nNo rows found in products table.');
      }
      db.end();
    });
  });
});
