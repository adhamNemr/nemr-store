const { Product, sequelize } = require("./models");

async function testSort() {
    try {
        const sql = 'CAST(CASE WHEN discountPrice > 0 THEN discountPrice ELSE price END AS FLOAT)';

        console.log("--- Testing Low to High Sort (Effective Price) ---");
        let products = await Product.findAll({
            order: [[sequelize.literal(sql), 'ASC']],
            attributes: ['name', 'price', 'discountPrice'],
            raw: true
        });

        products.forEach(p => {
            const effective = p.discountPrice > 0 ? p.discountPrice : p.price;
            console.log(`${effective} EGP - ${p.name} (Base: ${p.price}, Discount: ${p.discountPrice})`);
        });

        console.log("\n--- Testing High to Low Sort (Effective Price) ---");
        products = await Product.findAll({
            order: [[sequelize.literal(sql), 'DESC']],
            attributes: ['name', 'price', 'discountPrice'],
            raw: true
        });

        products.forEach(p => {
            const effective = p.discountPrice > 0 ? p.discountPrice : p.price;
            console.log(`${effective} EGP - ${p.name} (Base: ${p.price}, Discount: ${p.discountPrice})`);
        });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSort();
