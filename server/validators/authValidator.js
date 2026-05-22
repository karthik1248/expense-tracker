import Joi from 'joi'

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required()
})

export const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
})

export const expenseSchema = Joi.object({
    amount: Joi.number().positive().required(),
    category: Joi.string()
    .valid("food","transport","shopping","entertainment").required(),
    title: Joi.string().allow("",null),
    date: Joi.date().optional()
})

export const updateExpenseSchema = Joi.object({
    amount: Joi.number().positive(),
    category: Joi.string()
    .valid("food","transport","entertainment","shopping"),
    title: Joi.string().allow("",null),
    date: Joi.date()
})