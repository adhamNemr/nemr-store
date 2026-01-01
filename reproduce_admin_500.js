const axios = require('axios');

async function test() {
  try {
    // 1. Login as Admin
    console.log("Logging in as Admin...");
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

    // New 4a. Categories
    console.log("\nTesting Categories...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/categories', { headers });
        console.log("Categories OK");
    } catch (e) {
        console.error("Categories Failed:", e.response?.data || e.message);
    }

    // New 4b. Customers
    console.log("\nTesting Customers...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/customers', { headers });
        console.log("Customers OK");
    } catch (e) {
        console.error("Customers Failed:", e.response?.data || e.message);
    }

    // New 4c. Product Intelligence
    console.log("\nTesting Product Intelligence...");
    try {
        await axios.get('http://localhost:5002/api/dashboard/product-intelligence', { headers });
        console.log("Product Intelligence OK");
    } catch (e) {
        console.error("Product Intelligence Failed:", e.response?.data || e.message);
    }

    // 5. Test My Orders
    console.log("\nTesting My Orders...");
    try {
        await axios.get('http://localhost:5002/api/orders/my-orders', { headers });
        console.log("My Orders OK");
    } catch (e) {
        console.error("My Orders Failed:", e.response?.data || e.message);
    }

  } catch (err) {
    console.error('Test Failed:', err.message);
    if (err.response) console.error(err.response.data);
  } // Check if we can reproduce with existing seller too (maybe the specific user has bad data)
}

test();
