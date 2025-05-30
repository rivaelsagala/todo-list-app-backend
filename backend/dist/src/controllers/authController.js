"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = exports.getUser = void 0;
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUser = async (_req, res) => {
    try {
        const [rows] = await db_1.db.query("SELECT id, name, email FROM users ORDER BY id DESC");
        res.status(200).json({
            success: true,
            data: rows,
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data user",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.getUser = getUser;
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Validasi input
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Name, email, dan password harus diisi",
            });
            return;
        }
        // Cek apakah email sudah terdaftar
        const [existingUsers] = await db_1.db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            res.status(409).json({
                success: false,
                message: "Email sudah terdaftar",
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const [result] = await db_1.db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        res.status(201).json({
            success: true,
            message: "Register berhasil",
            data: {
                id: result.insertId,
                name,
                email,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Register gagal",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validasi input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email dan password harus diisi",
            });
            return;
        }
        // Cari user berdasarkan email
        const [rows] = await db_1.db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            res.status(401).json({
                success: false,
                message: "Email atau password salah",
            });
            return;
        }
        const user = rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Email atau password salah",
            });
            return;
        }
        // Membuat JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, process.env.JWT_SECRET || "your_jwt_secret_change_this_in_production", { expiresIn: "24h" });
        res.status(200).json({
            success: true,
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login gagal",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
exports.loginUser = loginUser;
