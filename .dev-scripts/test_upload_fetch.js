const fs = require('fs');
const path = require('path');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Fetch',
        email: 'fetch@example.com',
        password: 'password123'
      })
    });
    let loginData = await loginRes.json();
    if (!loginData.success) {
      const login2 = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'fetch@example.com',
          password: 'password123'
        })
      });
      loginData = await login2.json();
    }
    const token = loginData.data.token;

    // Use built-in FormData and fetch to upload image? Node 26 has FormData!
    const form = new FormData();
    form.append('name', 'Test Fetch Updated');
    
    // Node fetch FormData with File is slightly tricky, we can use Blob
    const blob = new Blob(['fake image'], { type: 'image/jpeg' });
    form.append('profileImage', blob, 'dummy.jpg');

    const uploadRes = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    const uploadData = await uploadRes.json();
    console.log("Upload response:", uploadData);

    const { PrismaClient } = require('./backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email: 'fetch@example.com' } });
    console.log("User in DB:", user.profileImageUpdatedAt);
    
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
  }
}
test();
