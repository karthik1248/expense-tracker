import bcrypt from 'bcrypt'
import fs from 'fs'
import jwt from'jsonwebtoken'
import User from '../models/User.js'    
import { loginSchema } from '../validators/authValidator.js'
import redisClient from '../redisClient.js'

export const loginUser = async (req, res)=>{
    try {
        const { error } = loginSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }
        const { identifier, password } = req.body

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        })
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const checkedPassword = await bcrypt.compare(password, user.password)
        if (!checkedPassword) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        )
        res.json({ token })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
}

export const registerUser = async(req,res) =>{
    try {
        const { error } = registerSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }
        const { username, email, password } = req.body

        const userName = await User.findOne({ email })
        if (userName) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        })
        res.json({ message: "User registered" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
}

export const getCurrentUser = async(req,res)=>{
    try {
        const cacheKey = `user:${req.user.id}`
        const cachedUser = await redisClient.get(cacheKey)
        if(cachedUser){
            console.log("USER CACHE HIT")
            return res.json(JSON.parse(cachedUser))
        }
        console.log("USER CACHE MISS")
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }
        await redisClient.set(
            cacheKey,
            JSON.stringify(user),
            "EX",
            60
        )

        res.json(user)

    } catch (err) {
        res.status(401).json({ message: "Invalid token" })
    }
}

export const updateProfile = async(req,res)=>{
    try {
        const userId = req.user.id
        const { username, email } = req.body
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true }
        )
        await redisClient.del(`user:${req.user.id}`)
        res.json(updatedUser)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

export const updateProfilePic = async(req,res) =>{
    try {
        console.log(req.file)
        const imagePath = req.file.path
        const user = await User.findById(req.user.id)
        if(user.profilePic){
            fs.unlink(user.profilePic, (err) =>{
                if(err){
                    console.log(err)
                }
            })
        }
        
        await User.findByIdAndUpdate(
            req.user.id,
            {
                profilePic: imagePath
            }
        )
        await redisClient.del(`user:${req.user.id}`)
        res.json({
            message: "Profile picture uploaded",
            profilePic: imagePath
        })
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
}

export const removeProfilePic = async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
        if(user.profilePic){
            fs.unlink(user.profilePic, (err)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        await User.findByIdAndUpdate(
            req.user.id,
            {
                profilePic: ""
            }
        )
        await redisClient.del(`user:${req.user.id}`)
        res.json({message:"profile picture removed"})
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
}