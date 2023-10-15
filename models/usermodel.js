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
          firstname:{type :String,
                
                    },
                   lastname:{type :String,
                            
                              },
                              phonenumber:{type :String,
                                     
                                        },
          isadmin:{
                    type:Number,
                    default:0
          },
          posts: [
            {
              id: String,
                content: String
            }
        ]
})



const model = new mongoose.model('logdata',userSchema)


module.exports = model 

