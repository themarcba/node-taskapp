const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const router = new express.Router()
const auth = require('../middleware/auth.middleware')
const sharp = require('sharp')


const User = require('../models/User.model')
const { sendWelcomeMail, sendByeMail } = require('../emails/account')

// Multer configuration
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload an image'))
        }
        callback(undefined, true)
    }
})

// Create user / Signup
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeMail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// Login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// Logout user
router.get('/users/logout', auth, async (req, res) => {
    try {
        req.currentUser.tokens = req.currentUser.tokens.filter(token => token.token !== req.token)
        await req.currentUser.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// Logout user from all sessions
router.get('/users/logout/all', auth, async (req, res) => {
    try {
        req.currentUser.tokens = []
        await req.currentUser.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// Read user profile (currently logged in)
router.get('/users/me', auth, async (req, res) => {
    res.send(req.currentUser)
})

// Read user
router.get('/users', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).send()
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    // Not a valid operation
    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!', allowed: allowedUpdates })

    const id = req.params.id
    try {
        updates.forEach(update => req.currentUser[update] = req.body[update])
        await req.currentUser.save()
        res.send(req.currentUser)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.currentUser.remove()
        sendByeMail(req.currentUser.email, req.currentUser.name)
        res.send(req.currentUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Upload profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250, cover: true }).png().toBuffer()
    req.currentUser.avatar = buffer
    await req.currentUser.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.currentUser.avatar = undefined
    await req.currentUser.save()
    res.send()
})

// Serve avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router