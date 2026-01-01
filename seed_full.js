const { User, Product, Order, OrderItem, Coupon } = require('./models');
const sequelize = require('./config/db');
const bcrypt = require('bcrypt');

// Stable Placeholder Images
const IMAGES = {
    electronics: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', // Watch
        'https://images.unsplash.com/photo-1588872657578-8388bd871d2e?auto=format&fit=crop&w=600&q=80', // Speaker
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Headphones
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80', // Polaroid
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=600&q=80', // Laptop
    ],
    fashion: [
        'https://images.unsplash.com/photo-1551028919-ac66c5f8b6b9?auto=format&fit=crop&w=600&q=80', // Leather Jacket
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', // Red Shoes
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', // Denim Jacket
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80', // T-Shirt
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=600&q=80', // Dress
    ],
    home: [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', // Lamp
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Art
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', // Chair
    ]
};

const seedFull = async () => {
  try {
    console.log('🔄 Cleaning Database...');
    await sequelize.sync({ force: true }); 
    console.log('✅ Database Cleaned.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Users
    const admin = await User.create({
      username: 'Adham Admin',
      email: 'admin@nemr.store',
      password: hashedPassword,
      role: 'admin'
    });

    const seller = await User.create({
      username: 'Sara Seller',
      email: 'seller@nemr.store', 
      password: hashedPassword,
      role: 'seller'
    });

    const customer = await User.create({
      username: 'Karim Customer',
      email: 'customer@nemr.store',
      password: hashedPassword,
      role: 'customer'
    });

    console.log('✅ Users Created.');

    // 2. Rich Products Data
    const productsData = [
        // Electronics
        { name: 'Apple Watch Series 9', price: 18500, category: 'Electronics', image: IMAGES.electronics[0], stock: 15, allowDiscounts: true },
        { name: 'JBL Flip 6 Speaker', price: 5400, category: 'Electronics', image: IMAGES.electronics[1], stock: 8, allowDiscounts: true },
        { name: 'Sony WH-1000XM5', price: 12900, category: 'Electronics', image: IMAGES.electronics[2], stock: 3, allowDiscounts: false }, // No discount
        { name: 'Polaroid Now+ Camera', price: 8200, category: 'Electronics', image: IMAGES.electronics[3], stock: 0, allowDiscounts: true }, // Out of stock
        { name: 'Dell XPS 13 Laptop', price: 65000, category: 'Electronics', image: IMAGES.electronics[4], stock: 2, allowDiscounts: true }, // Low stock

        // Fashion
        { name: 'Vintage Leather Jacket', price: 3500, category: 'Fashion', image: IMAGES.fashion[0], stock: 10, allowDiscounts: true },
        { name: 'Nike Air Max Red', price: 4200, category: 'Fashion', image: IMAGES.fashion[1], stock: 20, allowDiscounts: true },
        { name: 'Denim Trucker Jacket', price: 1800, category: 'Fashion', image: IMAGES.fashion[2], stock: 50, allowDiscounts: true },
        { name: 'Essential Cotton Tee', price: 450, category: 'Fashion', image: IMAGES.fashion[3], stock: 100, allowDiscounts: false },
        { name: 'Summer Floral Dress', price: 1200, category: 'Fashion', image: IMAGES.fashion[4], stock: 12, allowDiscounts: true },

        // Home
        { name: 'Modern Desk Lamp', price: 850, category: 'Home', image: IMAGES.home[0], stock: 30, allowDiscounts: true },
        { name: 'Abstract Wall Art', price: 2100, category: 'Home', image: IMAGES.home[1], stock: 1, allowDiscounts: true }, // Low stock
        { name: 'Velvet Accent Chair', price: 4500, category: 'Home', image: IMAGES.home[2], stock: 4, allowDiscounts: false },
    ];

    const products = await Product.bulkCreate(productsData.map(p => ({
        ...p,
        description: `Experience adequate quality with the ${p.name}. Top rated product in ${p.category}.`,
        size: 'Standard',
        condition: 'new',
        userId: seller.id,
        status: 'active'
    })));

    console.log(`✅ ${products.length} Products Created.`);

    // 3. Coupons
    await Coupon.bulkCreate([
        { code: 'WELCOME2025', discountType: 'percentage', value: 15, usageLimit: 1000, minOrderValue: 500, sellerId: seller.id },
        { code: 'FLASH50', discountType: 'fixed', value: 50, usageLimit: 50, minOrderValue: 200, sellerId: seller.id }
    ]);
    console.log('✅ Coupons Created.');

    // 4. Orders
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    const cities = ['Cairo', 'Giza', 'Alexandria', 'Mansoura'];
    const orderItemsToCreate = [];
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    console.log('🔄 Generating 30 Realistic Orders...');

    for (let i = 0; i < 30; i++) {
        const numItems = randomInt(1, 3);
        const selectedProducts = [];
        let orderTotal = 0;

        for (let j = 0; j < numItems; j++) {
            const prod = products[randomInt(0, products.length - 1)];
            selectedProducts.push(prod);
            orderTotal += prod.price;
        }

        const date = new Date();
        date.setDate(date.getDate() - randomInt(0, 30));

        const order = await Order.create({
            userId: customer.id,
            totalPrice: orderTotal,
            status: random(statuses),
            shippingAddress: '123 Main St, Cairo',
            city: random(cities),
            phone: '01000000000',
            paymentMethod: 'COD',
            createdAt: date,
            updatedAt: date
        });

        for (const prod of selectedProducts) {
             orderItemsToCreate.push({
                 orderId: order.id,
                 productId: prod.id,
                 quantity: 1,
                 price: prod.price,
                 createdAt: date,
                 updatedAt: date
             });
        }
    }

    await OrderItem.bulkCreate(orderItemsToCreate);
    console.log('✅ 30 Orders with Items Created.');
    
    console.log('🎉 SEEDING COMPLETE! Login as seller@nemr.store / password123');
    process.exit();

  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedFull();
