const express = require('express');
const router = express.Router();
const { validationResult, checkSchema, body } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const model = require('../models/usermodel');

function checkSignIn(req, res, next) {
  if (req.session.isAuth) {
    next(); // If session exists, proceed to the page
  } else {
    res.redirect('/user//');
  }
}




router.get('/',(req,res)=>{
  if(req.session.isAuth)
  {
  res.redirect('/user/home')
  }

else{

res.render('./login')

}
})

router.get('/signup',(req,res)=>{
if(!req.session.isAuth)
res.render('./signup')
else
res.redirect('/user/home')
})
router.get('/home',checkSignIn,(req,res)=>{
if(req.session.isAuth)
  res.render('home',{username:req.session.email})
})



const registrationSchema = {
email: {

custom: {
options: value => {
    return model.find({
        email: value
    }).then(user => {
        if (user.length > 0) {
            return Promise.reject()
        }
    })
}
}
},
}



router.post('/signup',checkSchema(registrationSchema),async (req,res)=>{
if(req.session.isAuth){
const errors = validationResult(req);
if (!errors.isEmpty()) {
req.flash('error','email exists')
return res.redirect('/user/signup')
}

const {email,firstname,lastname,phonenumber,password} = req.body

let errorMessages = [];
  
if (!email) {
errorMessages.push('Email is required');
}

if (!password) {
errorMessages.push('Password is required');
}
if(!firstname || !lastname || !phonenumber) {
errorMessages.push('fill in details properly')
}

if (errorMessages.length > 0) {
req.flash('error', errorMessages.join(', '));
return res.redirect('/user/signup');
}


var hash = await bcrypt.hash(req.body.password,saltRounds) 




  const user = await model.insertMany([{
            email:req.body.email,
           firstname:req.body.firstname,
           lastname:req.body.lastname,
           phonenumber:req.body.phonenumber,
            password:hash,
            isadmin:0
  }])

 res.redirect('/user/home')
}
 else
 {
 req.flash('success','registration success')
 res.redirect('/user//')
 }

 
})


router.post('/login',async (req,res)=>{



  try { 
    const { email, password } = req.body;
    let errorMessages = [];
  
    if (!email) {
      errorMessages.push('Email is required');
    }
  
    if (!password) {
      errorMessages.push('Password is required');
    }
  
    if (errorMessages.length > 0) {
      req.flash('error', errorMessages.join(', '));
      return res.redirect('/user//');
    }
  
      
            // check if the user exists 
            const user = await model.findOne({ email: req.body.email }); 
            const isMatch = await bcrypt.compare(req.body.password,user.password)
            if (isMatch) { 
             req.session.isAuth = true;
             req.session.email = req.body.email

              
             res.redirect("/user/home")
              } else { 
                 req.flash('error','invalid login credentials')
                res.redirect('/user//')
              } 
            
          } catch (error) { 
            req.flash('error','invalid login credentials')
            res.redirect('/user//')
          }
  

})
router.get('/logout',(req,res)=>{
req.session.isAuth = false
req.session.destroy()
res.redirect('/user//')
})


// ... Rest of the user authentication routes

module.exports = router;
