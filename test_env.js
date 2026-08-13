const fs = require('fs');
const path = require('path');

console.log('--- TEST ENV SCRIPT ---');
console.log('Current directory:', __dirname);

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('.env file EXISTS!');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('RAW content lines:');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        // Mask value for security
        const masked = value.length > 2 ? value.substring(0, 2) + '*'.repeat(value.length - 2) : '**';
        console.log(`- KEY: [${key}], MASKED VALUE: [${masked}]`);
      }
    });
  } else {
    console.log('.env file DOES NOT exist in this folder!');
  }
} catch (e) {
  console.error('Error reading .env:', e.message);
}
