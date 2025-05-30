import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
} from "../controllers/authController";

// import { loginUser } from "../controllers/loginController";

const router = express.Router();

router.get("/", getUser);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
