import express from 'express'
import cors from 'cors'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import fs from 'fs'
import authMiddleware from '../middleware/authMiddleware.js'
import { registerSchema } from '../validators/authValidator.js'
import { getCurrentUser, loginUser, registerUser, removeProfilePic, updateProfile, updateProfilePic } from "../controllers/authController.js"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})


const router = express.Router()
const upload = multer({
    storage,
    limits: {
        fileSize: 2*1024*1024
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg"
        ]
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        }
        else {
            cb(new Error("Only png, jpg aur jpeg allowed"))
        }
    }

})

router.get('/me', authMiddleware, getCurrentUser)

router.post('/register', registerUser)

router.post("/login",loginUser)

router.put('/update', authMiddleware, updateProfile)

router.post("/upload-profile-pic", authMiddleware, upload.single("profilePic"), updateProfilePic)

router.delete("/remove-profile-pic", authMiddleware, removeProfilePic)

export default router