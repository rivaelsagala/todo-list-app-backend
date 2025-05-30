"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db_1.db.query("SELECT * FROM users WHERE email = ?", [
            email,
        ]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Email tidak ditemukan" });
        }
        const user = rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }
        res.status(200).json({
            message: "Login berhasil",
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Login gagal", error });
    }
};
exports.loginUser = loginUser;
