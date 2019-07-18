const calculateTip = (total, tipPercent = .25) => total * (tipPercent + 1)

const fahrenheitToCelsius = (temp) => {
    return (temp - 32) / 1.8
}

const celsiusToFahrenheit = (temp) => {
    return (temp * 1.8) + 32
}

const add = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(a >= 0 && b >= b) {
                resolve(a + b)
            } else {
                reject('Numbers must be non-negative')
            }
        }, 2000);
    })
}

module.exports = {
    calculateTip,
    fahrenheitToCelsius,
    celsiusToFahrenheit,
    add
}