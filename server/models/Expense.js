import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
    amount: Number,
    category: String,
    title: String,
    date: {
        type: Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const Expense = mongoose.model("Expense",expenseSchema)

export default Expense