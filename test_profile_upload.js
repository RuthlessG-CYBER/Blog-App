const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    // 1. Get token by logging in
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com', // we need a valid user
      password: 'password123'
    }).catch(e => e.response);

    let token;
    if (loginRes.data?.data?.token) {
      token = loginRes.data.data.token;
    } else {
      // register
      const regRes = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Test User',
        email: 'test_upload@example.com',
        password: 'password123'
      });
      token = regRes.data.data.token;
    }

    // 2. Upload image
    const form = new FormData();
    form.append('name', 'Test User Updated');
    
    // Create a dummy image
    fs.writeFileSync('dummy.jpg', 'fake image content');
    form.append('profileImage', fs.createReadStream('dummy.jpg'));

    const uploadRes = await axios.put('http://localhost:3000/api/auth/profile', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Upload response:", uploadRes.data);

    // 3. Check DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email: 'test_upload@example.com' } });
    console.log("User in DB:", user.profileImageUpdatedAt);
    
    fs.unlinkSync('dummy.jpg');
    await prisma.$disconnect();

  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
