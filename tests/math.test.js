require('dotenv').config({ path: '.env.test' })

const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../src/math')

test('Should calculate total with tip', () => {
    const total = calculateTip(10, .3)
    expect(total).toBe(13)
})

// test('Should calculate total with tip using default tip', () => {
//     const total = calculateTip(10)
//     expect(total).toBe(12.5)
// })

// test('Should convert 32F to 0C', () => {
//     const celsius = fahrenheitToCelsius(32)
//     expect(celsius).toBe(0)
// })


// test('Should convert 0C to 32C', () => {
//     const fahrenheit = celsiusToFahrenheit(0)
//     expect(fahrenheit).toBe(32)
//     console.log('PORT', process.env.PORT);

// })

// test('Should add two numbers async/await', async () => {
//     const sum = await add(5,4)
//     expect(sum).toBe(9)

// })