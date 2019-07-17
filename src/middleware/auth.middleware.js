const jwt = require('jsonwebtoken')
const User = require('../models/User.model')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'somerandomstring')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) throw new Error()

        req.currentUser = user
        req.token = token
        
        next()
    } catch (error) {
        res.status(401).send({ error: 'Authentication required' })
    }
}

module.exports = auth