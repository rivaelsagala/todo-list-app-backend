import { Request, Response } from "express";
import { db } from "../config/db";
import { Auth } from "../models/auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Interface untuk user data dari database
interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
}

export const getUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<UserRow[]>(
      "SELECT id, name, email FROM users ORDER BY id DESC"
    );
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body as Auth;

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
    const [existingUsers] = await db.query<UserRow[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Register berhasil",
      data: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Register gagal",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
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
    const [rows] = await db.query<UserRow[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
      return;
    }

    // Membuat JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "your_jwt_secret_change_this_in_production",
      { expiresIn: "24h" }
    );

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login gagal",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
