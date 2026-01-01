const { User, Product } = require('./models');
const sequelize = require('./config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB

    const hashedPassword = await bcrypt.hash('password123', 10);
    // Create a default user first to satisfy foreign key constraints
    await User.create({
      username: 'admin',
      email: 'admin@nemr.store',
      password: hashedPassword,
      role: 'admin'
    });

    await Product.bulkCreate([
      {
        name: 'Oversized Cotton Shirt',
        price: 899,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop',
        description: 'Premium oversized cotton shirt.',
        size: 'L',
        condition: 'new',
        category: 'men',
        userId: 1
      },
      {
        name: 'Slim Fit Linen Blazer',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=2069&auto=format&fit=crop',
        description: 'Elegant linen blazer.',
        size: 'M',
        condition: 'new',
        category: 'men',
        userId: 1
      },
      {
        name: "Air Force 1 '07",
        price: 4799,
        image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1964&auto=format&fit=crop',
        description: 'Iconic sneakers.',
        size: '42',
        condition: 'new',
        category: 'shoes',
        userId: 1
      },
      {
        name: 'Gazelle Sneakers',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=2025&auto=format&fit=crop',
        description: 'Classic Adidas Gazelle.',
        size: '43',
        condition: 'new',
        category: 'shoes',
        userId: 1
      },
      {
        name: 'Summer Floral Dress',
        price: 1899,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=2000&auto=format&fit=crop',
        description: 'Beautiful light summer dress.',
        size: 'S',
        condition: 'new',
        category: 'women',
        userId: 1
      }
    ]);

    console.log('Database Seeded with Categories Successfully');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seed();
