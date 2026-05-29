const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/generateTokens");

const signup = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword],
            (err, result) => {

                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            message: "Email already exists"
                        });
                    }

                    return res.status(500).json(err);
                }

                const user = {
                    id: result.insertId,
                    email
                };

                const accessToken =
                    generateAccessToken(user);

                const refreshToken =
                    generateRefreshToken(user);

                res.status(201).json({
                    message: "Signup successful",
                    user: {
                        id: user.id,
                        name,
                        email
                    },
                    accessToken,
                    refreshToken
                });
            }
        );

    } catch (error) {
        res.status(500).json(error);
    }
};


// Sign in Function
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const sql =
            `SELECT * FROM users WHERE email = ?`;

        db.query(sql, [email], async (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {

                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = result[0];

            const isPasswordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!isPasswordCorrect) {

                return res.status(401).json({
                    message: "Invalid Password"
                });
            }

            const accessToken =
                generateAccessToken(user);

            const refreshToken =
                generateRefreshToken(user);

            return res.status(200).json({

                message: "Login successful",

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },

                accessToken,
                refreshToken
            });

        });

    } catch (error) {

        return res.status(500).json(error);
    }
};

// Protected Route Example
const getProfile = (req, res) => {

    res.status(200).json({

        message: "Protected Route Accessed",

        user: req.user
    });
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const sql = "SELECT id, email FROM users WHERE id = ?";
        db.query(sql, [decoded.id], (err, rows) => {
            if (err) return res.status(500).json({ message: "DB error" });
            if (!rows?.length) {
                return res.status(401).json({ message: "User not found" });
            }
            const accessToken = generateAccessToken(rows[0]);
            return res.status(200).json({ accessToken });
        });
    } catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};

module.exports = {
    signup,
    login,
    refresh,
    getProfile,
};