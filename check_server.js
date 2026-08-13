const fs = require('fs');
const path = require('path');

console.log('--- CHECK SERVER.JS CONTENT ---');
try {
  const filePath = path.join(__dirname, 'server.js');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('Lines 1-50 of server.js on server:');
    console.log(content.split('\n').slice(0, 50).join('\n'));
  } else {
    console.log('server.js does not exist in this folder!');
  }
} catch (e) {
  console.error('Error:', e.message);
}
