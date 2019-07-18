require('dotenv').config()

const express = require('express')
require('./db/mongoose.connect') // Connect to DB

const userRouter = require('./routers/user.router')
const taskRouter = require('./routers/task.router')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app