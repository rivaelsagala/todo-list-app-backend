import { Request, Response } from "express";
import { db } from "../config/db";
import { Auth } from "../models/auth";
import bcrypt from "bcryptjs";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    res.status(200).json({
      message: "Login berhasil",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Login gagal", error });
  }
};
