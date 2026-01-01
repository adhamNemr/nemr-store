const axios = require('axios');

async function test() {
  try {
    // 1. Login
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
        email: 'admin@nemr.store',
        password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login Success. Token:', token.substring(0, 10));

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Stats
    console.log("\nTesting Stats...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/stats', { headers });
        console.log("Stats OK");
    } catch (e) {
        console.error("Stats Failed:", e.response?.data || e.message);
    }

    // 3. Test Sales
    console.log("\nTesting Sales...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/sales', { headers });
        console.log("Sales OK");
    } catch (e) {
        console.error("Sales Failed:", e.response?.data || e.message);
    }

    // 4. Test Top Products
    console.log("\nTesting Top Products...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/top-products', { headers });
        console.log("Top Products OK");
    } catch (e) {
        console.error("Top Products Failed:", e.response?.data || e.message);
    }

  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

test();
