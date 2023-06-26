const auth = require('./auth')

auth.startup()

console.log(auth.checkKey(3,"miau"))