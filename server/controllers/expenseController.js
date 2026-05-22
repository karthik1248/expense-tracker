import Expense from '../models/Expense.js'
import mongoose from 'mongoose'
import { expenseSchema } from '../validators/authValidator.js'
import { updateExpenseSchema } from '../validators/authValidator.js'


export const addExpense = async(req,res)=>{
     try {
        const {error} = expenseSchema.validate(req.body)
        if(error){
            return res.status(400).json({message:error.details[0].message})
        }
        const {amount, category, title, date} = req.body
        const expense = await Expense.create({
            amount,
            category,
            title,
            date,
            user: req.user.id
        })
        res.json(expense)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error " })
    }
}

export const getExpense = async(req,res)=>{
    try {
        const { category, title, startDate, endDate, page, limit, sort } = req.query
        const isAll = req.query.all === "true"
        const pageNum = parseInt(page) || 1
        const limitNum = parseInt(limit) || 5
        const skip = (pageNum - 1) * limitNum

        let filter = {
            user: req.user.id
        }
        if (category) {
            filter.category = { $regex: `^${category}$`, $options: 'i'}
        }
        if (title) {
            filter.title = { $regex: title, $options: "i" }
        }
        if (startDate || endDate) {
            filter.date = {}
            if (startDate) {
                const start = new Date(startDate)
                if (!isNaN(start)) {
                    filter.date.$gte = start
                }
            }
            if (endDate) {
                const end = new Date(endDate)
                if (!isNaN(end)) {
                    filter.date.$lte = end
                }
            }
        }
        let sortOption = {date: -1}
        if (sort) {
            if (sort.startsWith("-")) {
                const field = sort.substring(1);
                sortOption = { [field]: -1 };
            } else {
                sortOption = { [sort]: 1 };
            }
        }
        const total = await Expense.countDocuments(filter) 
        const totalPages = Math.ceil(total/limitNum)
        console.log("CATEGORY FROM QUERY:", category)
        console.log("FILTER OBJECT:", filter)
        // const expenses = await Expense.find(filter).sort(sortOption).skip(skip).limit(limitNum)
        let query = Expense.find(filter).sort(sortOption)
        if(!isAll){
            query = query.skip(skip).limit(limitNum)
        }
        const expenses = await query
        res.json({expenses,total,page:pageNum,totalPages})
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

export const updateExpense = async(req,res)=>{
    try {
        const {error} = updateExpenseSchema.validate(req.body)
        if(error){
            return res.status(401).json({message: error.details[0].message})
        }
        const id = req.params.id
        const { amount, category, title, date } = req.body
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { amount, category, title, date },
            // req.body,
            { returnDocument : 'after'}
        )
        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found or unauthorized" })
        }
        res.json(updatedExpense)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
}

export const deleteExpense = async(req,res)=>{
    try {
            const id = req.params.id
            const deleteExpense = await Expense.findByIdAndDelete({ _id: id, user: req.user.id })
            if (!deleteExpense) {
                return res.status(404).json("Invalid input")
            }
            res.json({ message: "Expense deleted" })
        } catch (err) {
            console.log(err)
            res.status(500).json("Server error")
        }
}

export const summary = async(req,res)=>{
    try{
        console.log("Summary running")
        const result = await Expense.aggregate([
            {
                $match:{
                    user:  new mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $group:{    
                    _id:"category",
                    total:{$sum:"$amount"}
                }   
            }
        ])

        const summary = {
            total:0,
            food:0,
            transport:0,
            entertainment:0,
            shopping:0
        }

        result.forEach(item => {
            summary[item._id] = item.total
            summary.total += item.total
        })
        res.json(summary)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Server Error"})
    }
}