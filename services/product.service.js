const { Product, User, ProductVariant, Cart, sequelize } = require("../models");
const { Op } = require("sequelize");

class ProductService {
    async listProducts(filters = {}) {
        const { q, cat, condition, sort, limit = 50, offset = 0, userId, userRole, dashboard } = filters;
        let whereClause = {};

        if (dashboard === 'true' && userId && userRole === 'seller') {
            whereClause.userId = userId;
        }

        if (q) {
            const queryTerms = q.trim().split(/\s+/);
            whereClause[Op.and] = queryTerms.map(term => ({
                [Op.or]: [
                    { name: { [Op.like]: `%${term}%` } },
                    { description: { [Op.like]: `%${term}%` } }
                ]
            }));
        }

        if (cat) {
            whereClause.category = { [Op.like]: cat }; 
        }
        if (condition && condition !== 'all') whereClause.condition = condition;

        console.log(`[ProductService] Sorting products by: ${sort}`);

        // Robust numeric calculation for price after discount, handling SQLite empty-string/null quirks
        const effectivePriceSql = '(CASE WHEN (discountPrice IS NOT NULL AND discountPrice > 0) THEN CAST(discountPrice AS FLOAT) ELSE CAST(price AS FLOAT) END)';

        let orderClause;
        if (sort === 'price-low') {
            orderClause = [[sequelize.literal(effectivePriceSql), 'ASC']];
        } else if (sort === 'price-high') {
            orderClause = [[sequelize.literal(effectivePriceSql), 'DESC']];
        } else if (sort === 'stock-low') {
            orderClause = [['stock', 'ASC']];
        } else {
            orderClause = [['id', 'DESC']];
        }

        console.log(`[ProductService] FINAL orderClause:`, JSON.stringify(orderClause));

        const results = await Product.findAndCountAll({
            where: whereClause,
            attributes: {
                include: [
                    [sequelize.literal(effectivePriceSql), 'effectivePrice']
                ]
            },
            include: [
                { model: User, attributes: ['username'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            subQuery: false
        });

        console.log(`[ProductService] First few results for ${sort}:`);
        results.rows.slice(0, 5).forEach(r => {
            console.log(` - ${r.name}: ${r.getDataValue('effectivePrice')} EGP (Base: ${r.price})`);
        });

        return results;
    }

    async getProduct(id) {
        const product = await Product.findByPk(id, {
            include: [{ model: ProductVariant, as: 'variants' }]
        });
        if (product) {
            product.views += 1;
            await product.save({ validate: false });
        }
        return product;
    }

    async createProduct(data, userId) {
        const { name, variants, ...rest } = data;
        let totalStock = data.stock || 0;
        if (variants && Array.isArray(variants)) {
            totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        return await sequelize.transaction(async (t) => {
            // Clean/Cast numeric data
            const productData = {
                ...rest,
                name: name.trim(),
                userId,
                stock: totalStock,
                price: parseFloat(rest.price) || 0,
                discountPrice: (rest.discountPrice === '' || rest.discountPrice === null) ? null : parseFloat(rest.discountPrice)
            };

            // Validation: Discount must be lower than original price
            if (productData.discountPrice !== null && productData.discountPrice >= productData.price) {
                throw new Error("Sale price must be lower than the original price");
            }

            const newProduct = await Product.create(productData, { transaction: t });

            if (variants && Array.isArray(variants)) {
                const variantData = variants.map(v => ({ ...v, productId: newProduct.id }));
                await ProductVariant.bulkCreate(variantData, { transaction: t });
            }

            return newProduct;
        });
    }

    async updateProduct(id, data, userId, userRole) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error("Product not found");
        
        console.log(`[AuthCheck] Product ID: ${id}, Product Owner: ${product.userId}, Current User: ${userId}, Role: ${userRole}`);
        
        // Use loose equality or string conversion to handle type differences (number vs string)
        if (userRole !== 'admin' && String(product.userId) !== String(userId)) {
            console.error(`[AuthCheck] DENIED: product.userId (${typeof product.userId}: ${product.userId}) !== userId (${typeof userId}: ${userId})`);
            throw new Error("Unauthorized");
        }

        const { variants, ...rest } = data;
        const productIdNum = parseInt(id);

        return await sequelize.transaction(async (t) => {
            console.log(`[ProductUpdate] --- START UPDATE FOR ID: ${id} ---`);
            
            // 1. Update basic fields with explicit numeric casting for price fields
            const fieldsToUpdate = ['name', 'price', 'discountPrice', 'description', 'image', 'images', 'category', 'condition', 'status', 'allowDiscounts'];
            fieldsToUpdate.forEach(field => {
                if (rest[field] !== undefined) {
                    if (field === 'price' || field === 'discountPrice') {
                        // Ensure we save as numbers to prevent SQLite string-sorting issues
                        product[field] = (rest[field] === '' || rest[field] === null) ? null : parseFloat(rest[field]);
                    } else {
                        product[field] = rest[field];
                    }
                }
            });

            // Validation: Discount must be lower than original price
            if (product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice >= product.price) {
                throw new Error("Sale price must be lower than the original price");
            }

            // 2. Handle Stock and Variations
            if (variants && Array.isArray(variants) && variants.length > 0) {
                console.log(`[ProductUpdate] Variations count: ${variants.length}. Clearing old variants...`);
                await ProductVariant.destroy({ where: { productId: productIdNum }, transaction: t });
                
                const variantData = variants.map(v => ({
                    color: v.color || null,
                    size: v.size || null,
                    stock: parseInt(v.stock) || 0,
                    images: Array.isArray(v.images) ? JSON.stringify(v.images) : (v.images || '[]'),
                    productId: productIdNum
                }));

                await ProductVariant.bulkCreate(variantData, { transaction: t });
                
                const totalFromVariants = variantData.reduce((sum, v) => sum + v.stock, 0);
                product.stock = totalFromVariants;
                console.log(`[ProductUpdate] FORCING global stock to variant sum: ${totalFromVariants}`);
            } else {
                console.log(`[ProductUpdate] No variations provided. Using global stock: ${rest.stock}`);
                if (rest.stock !== undefined) {
                    product.stock = parseInt(rest.stock) || 0;
                }
                // Also clear if they were there before but now removed
                await ProductVariant.destroy({ where: { productId: productIdNum }, transaction: t });
            }

            console.log(`[ProductUpdate] Final check before save - Stock: ${product.stock}, Price: ${product.price}`);
            await product.save({ transaction: t });
            
            console.log(`[ProductUpdate] --- UPDATE SUCCESSFUL ---`);
            return product;
        });
    }

    async deleteProduct(id, userId, userRole) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error("Product not found");
        if (userRole !== 'admin' && String(product.userId) !== String(userId)) throw new Error("Unauthorized");

        return await sequelize.transaction(async (t) => {
            await ProductVariant.destroy({ where: { productId: id }, transaction: t });
            await Cart.destroy({ where: { productId: id }, transaction: t });
            await product.destroy({ transaction: t });
        });
    }
}

module.exports = new ProductService();
