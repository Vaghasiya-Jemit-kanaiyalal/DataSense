const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                message: "Access Denied"
            });
        }

        const token =
            authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                message: "Token Missing"
            });
        }

        const verified =
            jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET
            );

        req.user = verified;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid Token"
        });
    }
};

module.exports = verifyToken;