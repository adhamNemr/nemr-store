const { Order, OrderItem, Product, sequelize } = require("./models");
const { Op } = require("sequelize");

async function testSellerFilter() {
    try {
        const userId = 2; // Default seller ID in seed
        const days = 7;
        const start = new Date();
        start.setDate(start.getDate() - days + 1);
        start.setHours(0, 0, 0, 0);

        console.log("Seller Filtering from:", start.toISOString());

        // Get seller revenue
        const rev7 = await OrderItem.findOne({
            attributes: [[sequelize.literal('SUM(OrderItem.quantity * OrderItem.price)'), 'revenue']],
            include: [
                { model: Product, where: { userId }, attributes: [] },
                { model: Order, where: { createdAt: { [Op.gte]: start } }, attributes: [] }
            ],
            raw: true
        });

        const rev30 = await OrderItem.findOne({
            attributes: [[sequelize.literal('SUM(OrderItem.quantity * OrderItem.price)'), 'revenue']],
            include: [
                { model: Product, where: { userId }, attributes: [] },
                { model: Order, where: { createdAt: { [Op.gte]: new Date(0) } }, attributes: [] }
            ],
            raw: true
        });

        console.log(`Seller Results: ${rev7.revenue} (7 days) vs ${rev30.revenue} (Total).`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSellerFilter();
