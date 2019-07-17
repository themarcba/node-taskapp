const express = require('express')
require('./db/mongoose.connect') // Connect to DB

const userRouter = require('./routers/user.router')
const taskRouter = require('./routers/task.router')

const app = express()
const port = process.env.PORT || 3000
const maintenance = false

// Maintenance mode
app.use((req, res, next) => {
    if (maintenance) res.status(503).send('Site is in maintenance mode. Please come back in a while.')
    else next()
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})