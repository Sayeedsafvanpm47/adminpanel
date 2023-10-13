const mongoose = require('mongoose')
const db = require('../connection/databse')

const userSchema = new mongoose.Schema({
          email:{type: String,
            required : true,
            unique : true

          },
          password:{type :String,
          required : true
          },
          isadmin:{
                    type:Number,
                    default:0
          }
})



const model = new mongoose.model('logdata',userSchema)


module.exports = model 

