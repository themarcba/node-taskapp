const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/User.model')
const Task = require('../../src/models/Task.model')

const userOneId = new mongoose.Types.ObjectId
const userOne = {
    _id: userOneId,
    name: 'Testy Testerson',
    email: 'testy@example.com',
    password: 'testy4711!?',
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
        }
    ]
}

const userTwoId = new mongoose.Types.ObjectId
const userTwo = {
    _id: userTwoId,
    name: 'Jesty Jesterson',
    email: 'jesty@example.com',
    password: 'jesty4711!?',
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
        }
    ]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 1',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 2',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task 3',
    completed: false,
    owner: userTwo._id
}

const populateDB = async () => {
    await User.deleteMany({})
    await Task.deleteMany({})
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    populateDB,
    userOneId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree
}