const User = require("../models/user.model");

exports.getAllUsers = async (req,res) => {
    try{
        // Admin only
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const users = await User.findAll({
            attributes : ["id","username","email","role","createdAt"],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({error : "error fetching users",details : err.message})
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if admin or requesting own data
        if (req.userRole !== 'admin' && req.userId !== parseInt(id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const user = await User.findByPk(id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: "Unauthorized: Admins only" });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.status = status;
        await user.save();

        res.json({ message: `User status updated to ${status}`, user: { id: user.id, username: user.username, status: user.status } });
    } catch (err) {
        res.status(500).json({ error: "Failed to update user status" });
    }
};