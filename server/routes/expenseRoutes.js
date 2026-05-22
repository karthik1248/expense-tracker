import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addExpense, getExpense, updateExpense, deleteExpense, summary } from '../controllers/expenseController.js'
import Expense from '../models/Expense.js'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/summary', authMiddleware, summary)

router.get('/', authMiddleware, getExpense)

router.post('/', authMiddleware, addExpense)

router.delete('/:id', authMiddleware, deleteExpense)

router.put('/:id', authMiddleware, updateExpense)


export default router