const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({message: 'User not found'});
        res.json(user);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

exports.createUser = async (req, res) => {
    const {name, email, password, coins = 0} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            coins,
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({message: 'User not found'});

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        user.coins = req.body.coins || user.coins;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({message: 'User not found'});

        await user.remove();
        res.json({message: 'User removed'});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};
