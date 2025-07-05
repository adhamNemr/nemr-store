const User = require("../models/user.model");

exports.getAllUsers = async (req,res) => {
    try{
        const users = await User.findAll({
            attributes : ["id","username","email","role","createdAt"]
        });
        res.status(200).json({ users });
    }catch(err){
        res.status(500).json({error : "error fetching users",details : err.message})
    }
};