const express = require("express");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header.split(" ")[1];

    if (!token) {
        res.status(401).json({
            message: "Unauthorized: No token provided",
        });
        return;
    }

    jwt.verify(token, "123456789", (err, decoded) => {
        if (err) {
            res.status(401).json({
                message: "Unauthorized: Invalid token",
            });
            return;
        }

        req.user = decoded.user;
        next();
    });
};

module.exports = authMiddleware;
