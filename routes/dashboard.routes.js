const router = require("express").Router();
const { getStats, getSalesChart, getTopProducts, getCategoryStats, getCustomers, getProductAnalytics, getCustomerDetails, getSellers } = require("../controllers/dashboard.controller");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/stats", getStats);
router.get("/sales", getSalesChart);
router.get("/top-products", getTopProducts);
router.get("/categories", getCategoryStats);
router.get("/customers", getCustomers);
// New specific endpoint for heavy data table
router.get("/product-intelligence", getProductAnalytics);

// NEW: Customer Details
router.get("/customers/:id", getCustomerDetails);

// NEW: Admin Sellers
router.get("/sellers", getSellers);

// Coupons
router.get("/coupons", require("../controllers/dashboard.controller").getCoupons);
router.post("/coupons", require("../controllers/dashboard.controller").createCoupon);
router.delete("/coupons/:id", require("../controllers/dashboard.controller").deleteCoupon);
router.put("/coupons/:id", require("../controllers/dashboard.controller").updateCoupon);

// Settings
router.get("/settings", require("../controllers/dashboard.controller").getSettings);
router.put("/settings", require("../controllers/dashboard.controller").updateSettings);

module.exports = router;