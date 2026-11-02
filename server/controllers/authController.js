const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = normalizeEmail(req.body.email);
        if (!name?.trim() || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        const otp = generateOTP();
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server ', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = normalizeEmail(req.body.email);
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (!user) return res.status(404).json({ message: 'Account not found' });
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        // Keep this response neutral so the endpoint does not disclose which
        // email addresses have accounts.
        if (!user) return res.json({ message: 'If an account exists, a reset code has been sent.' });

        const otp = generateOTP();
        await OTP.findOneAndDelete({ email, action: 'password_reset' });
        await OTP.create({ email, otp, action: 'password_reset' });
        await sendOTPEmail(email, otp, 'password_reset');

        res.json({ message: 'If an account exists, a reset code has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to send password reset code' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { otp, password } = req.body;
        const email = normalizeEmail(req.body.email);
        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Email, reset code, and new password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }

        const validOTP = await OTP.findOne({ email, otp, action: 'password_reset' });
        if (!validOTP) return res.status(400).json({ message: 'Invalid or expired reset code' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Account not found' });

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await OTP.deleteOne({ _id: validOTP._id });

        res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to reset password' });
    }
};
