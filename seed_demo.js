const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const db = require('./models'); // Imports index.js which initializes models

async function seed() {
  try {
    console.log("Starting seed...");
    
    // We assume db.sequelize matches the running instance connection
    // But index.js usually returns { sequelize, Sequelize, Product, ... }
    
    const Product = db.Product;
    const ProductVariant = db.ProductVariant;
    const User = db.User;

    // Use a transaction for safety
    const t = await db.sequelize.transaction();

    let user = await User.findOne();
    if (!user) {
        // Create a dummy user if none exists
        user = await User.create({
            username: "DemoAdmin",
            email: "demo@example.com",
            password: "hashedpassword123", // In real app use hash
            role: "admin"
        });
    }

    try {
        // Create Product
        const p = await Product.create({
            name: "Apple Style Demo T-Shirt",
            price: 500,
            description: "DEMO PRODUCT: Use this to test the color switching feature. Select Red/Blue to see different images.",
            image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", 
            category: "men",
            condition: "new",
            stock: 40,
            allowDiscounts: true,
            userId: user.id // Added userId
        }, { transaction: t });

        console.log(`Product created with ID: ${p.id}`);

        // Red Images
        const redImages = JSON.stringify([
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", // Red 1
            "https://plus.unsplash.com/premium_photo-1673356301535-21d152c92257?w=600&q=80"  // Red 2
        ]);

        // Blue Images
        const blueImages = JSON.stringify([
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80", // Blue 1
            "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&q=80"  // Blue 2 (Shirt)
        ]);

        // Variants: Red M, Red L, Blue M, Blue L
        await ProductVariant.create({ productId: p.id, color: "Red", size: "M", stock: 10, images: redImages }, { transaction: t });
        await ProductVariant.create({ productId: p.id, color: "Red", size: "L", stock: 10, images: redImages }, { transaction: t });

        await ProductVariant.create({ productId: p.id, color: "Blue", size: "M", stock: 10, images: blueImages }, { transaction: t });
        await ProductVariant.create({ productId: p.id, color: "Blue", size: "L", stock: 10, images: blueImages }, { transaction: t });

        await t.commit();
        console.log("Variants with images added successfully!");
        console.log(`CHECK PRODUCT ID: ${p.id}`);
        
    } catch (error) {
        await t.rollback();
        console.error("Error inside transaction:", error);
    }
    
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
      // Allow time to flush logs
      setTimeout(() => process.exit(0), 1000);
  }
}

seed();
