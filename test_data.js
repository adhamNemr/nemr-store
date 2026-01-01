const { Order, sequelize } = require("./models");
const { Op } = require("sequelize");

async function testFilter() {
    try {
        const days = 7;
        const start = new Date();
        start.setDate(start.getDate() - days + 1);
        start.setHours(0, 0, 0, 0);

        console.log("Filtering from:", start.toISOString());

        const count7 = await Order.count({
            where: { createdAt: { [Op.gte]: start } }
        });

        const count30 = await Order.count({
            where: { createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        });

        const total = await Order.count();

        console.log(`Results: ${count7} (7 days) vs ${count30} (30 days). Total: ${total}`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testFilter();
