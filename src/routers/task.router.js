const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth.middleware')
const Task = require('../models/Task.model')

// Create task
router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.currentUser._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Read tasks
// GET /tasks
// GET /tasks?completed=(true|false)
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:(asc|desc)
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) match.completed = req.query.completed === 'true'

    if(req.query.sortBy) {
        const [sortField, sortDirection] = req.query.sortBy.split(':')
        sort[sortField] = sortDirection === 'desc' ? -1 : 1
    }
    
    try {
        await req.currentUser.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.currentUser.tasks)
    } catch (error) {
        res.status(500).send()
    }
})

// Read task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.currentUser._id })
        if (!task) return res.status(404).send()
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

// Update task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    // Not a valid operation
    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!', allowed: allowedUpdates })

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.currentUser._id })
        if (!task) return res.status(404).send()

        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.currentUser._id })
        if (!task) return res.status(404).send()
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router