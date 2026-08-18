import express from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controler.js"
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

// when we refresh our page this route will help the user to check that the user is authorised
// example when we are in login page we refresh it we should stay in the same page

router.get("/check", protectRoute, checkAuth);

export default router;