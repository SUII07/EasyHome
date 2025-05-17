import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import ServiceProvider from '../models/ServiceProvider.js';
import Admin from '../models/admin.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, error: 'Not authorized, no token' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find user in all collections
            let user = await Customer.findById(decoded.userId || decoded.id).select('-password');
            if (!user) {
                user = await ServiceProvider.findById(decoded.userId || decoded.id).select('-password');
            }
            if (!user) {
                user = await Admin.findById(decoded.userId || decoded.id).select('-password');
            }
            if (!user) {
                return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Admin middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Not authorized as admin' });
    }
}; 