require('dotenv').config({ path: '.env.test' })
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User.model')

const { userOneId, userOne, populateDB } = require('./fixtures/db')

beforeEach(async () => {
    await populateDB()
})

test('Should sign up new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Marc Backes',
        email: 'hello@marc.dev',
        password: 'devpass123'
    }).expect(201)

    // Assertions about the response
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Marc Backes',
            email: 'hello@marc.dev'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('devpass123')
})

test('Should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not log in non-existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'hacker@example.com',
            password: 'wrong_password'
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for user with wrong Auth Bearer', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer abcdef`)
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for user with wrong Auth Bearer', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer abcdef`)
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Johnny'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Johnny')
})

test('Should not update invalid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Luxembourg'
        })
        .expect(400)

})

// ------------------------------------------------------------
// Extra tests
// ------------------------------------------------------------

test('Should not signup user with invalid name', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'test@example.com',
            password: 'mypasswd'
        })
        .expect(400)
})

test('Should not signup user with invalid email', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Marc',
            email: 'test@example',
            password: 'mypasswd'
        })
        .expect(400)
})

test('Should not signup user with invalid password (containing "password")', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Marc',
            email: 'test@example.com',
            password: 'mypassword'
        })
        .expect(400)
})

test('Should not signup user with invalid password (containing "password" with uppercase letters)', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Marc',
            email: 'test@example.com',
            password: 'notsecurePassWorD!'
        })
        .expect(400)
})

test('Should not signup user with invalid password (too short)', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Marc',
            email: 'test@example.com',
            password: 'short'
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    const response = await request(app)
        .patch('/users/me')
        .send({
            name: 'Johnny'
        })
        .expect(401)
})

test('Should not update user with invalid name', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        })
        .expect(400)

        const user = await User.findById(userOneId)
        expect(user.name).toBe(userOne.name)
})

test('Should not update user with invalid email', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'test@exampleDOTcom'
        })
        .expect(400)

        const user = await User.findById(userOneId)
        expect(user.email).toBe(userOne.email)
})

test('Should not update user with invalid password', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: '12345'
        })
        .expect(400)
})

test('Should not delete user if unauthenticated', async () => {
    const response = await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})