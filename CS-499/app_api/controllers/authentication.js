const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');

const register = async(req, res) => {
    // Validate message to insure that all parameters are present
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({"message": "All fields required"})        
        }

        try {
            const user = new User({
                name: req.body.name,      
                email: req.body.email,    
                password: ''              
            });
            user.setPassword(req.body.password); 
            
            const savedUser = await user.save();
            const token = savedUser.generateJWT();
            
            return res.status(200).json({ token }); 
        } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({"message": "Email already registered"});
        }
        return res.status(400).json({"message": err.message || "Registration failed"});
    }
};

const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({"message": "All fields required"});
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({"message": "Internal server error"});
        
        if (user) { 
            const token = user.generateJWT();
            return res.status(200).json({ token });
        } else { 
            return res.status(401).json(info);
        }
    })(req, res);
};

// Export methods that drive endpoints
module.exports = {
    register,
    login
};