const express = require('express')
const session = require('express-session')
const app = express()
const sessionmiddleware = 
          session({
            secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
            saveUninitialized: false,
            resave: false,
          })
        

 module.exports = sessionmiddleware