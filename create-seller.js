const { User } = require('./models');
const sequelize = require('./config/db');
const bcrypt = require('bcrypt');

const createSeller = async () => {
  try {
    await sequelize.sync();
    
    const hashedPassword = await bcrypt.hash('seller123', 10);
    
    const seller = await User.create({
      username: 'Ahmed Store',
      email: 'ahmed@nemr.store',
      password: hashedPassword,
      role: 'seller'
    });
    
    console.log('✅ Seller created successfully!');
    console.log('Email: ahmed@nemr.store');
    console.log('Password: seller123');
    console.log('Role:', seller.role);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createSeller();
