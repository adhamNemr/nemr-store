const { Product } = require('./models');

async function check() {
  console.log('Model Attributes:', Object.keys(Product.rawAttributes));
  try {
    const products = await Product.findAll();
    console.log('Success:', products.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

check();
