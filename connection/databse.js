const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/logdb')

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'))
db.once('open',()=>console.log('connection success'))

module.exports = db