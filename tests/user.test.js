require('dotenv').config({ path: '.env.test' })
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User.model')

const userOne = {
    name: 'Testy Testerson',
    email: 'testy@example.com',
    password: 'testy4711!?'
}

beforeEach(async () => {
    await User.deleteMany({})
    await new User(userOne).save()
})

test('Should sign up new user', async () => {
    await request(app).post('/users').send({
        name: 'Marc Backes',
        email: 'hello@marc.dev',
        password: 'devpass123'
    })
        .expect(201)
})

test('Newly signed-in user receives a token', (done) => {
    request(app).post('/users').send({
        name: 'Marc Backes',
        email: 'hello@marc.dev',
        password: 'devpass123'
    }).end((error, res) => {
        expect(res.body.token).not.toBeUndefined()
        done()
    })
})

test('Should log in user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Newly logged-in user receives a token', (done) => {
    request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).end((error, res) => {
        expect(res.body.token).not.toBeUndefined()
        done()
    })
})


test('Should not log in non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: 'hacker@example.com',
        password: 'wrong_password'
    }).expect(400)
})