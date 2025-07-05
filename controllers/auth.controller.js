const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.register = async (req, res) => {
const { username, email, password, role } = req.body;
if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
}
try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role || "customer"
    });
    res.status(201).json({
    message: "User created successfully",
    user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    }
    });
} catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
}
};

exports.login = async (req, res) => {
const { email, password } = req.body;
try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
    return res.status(400).json({ error: "User not found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
    return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
    );
    res.json({
    message: "Login successful",
    token,
    user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    }
    });
} catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
}
};