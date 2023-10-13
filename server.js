const express = require('express')
const model = require('./models/usermodel')

const session = require('express-session')
const path = require('path')
const flash = require('express-flash')
const app = express()
const adminrouter = require('./routes/admin')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {body,checkSchema,validationResult,check} = require('express-validator')
const { error } = require('console')


app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));

// app.use(flash())
app.use('/admin',adminrouter)
app.use(function (req, res, next) {
          res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          res.header('Expires', '-1');
          res.header('Pragma', 'no-cache');
          next()
      });


app.use(session({
          secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
          saveUninitialized:false,
          
          resave: false
      }));

      app.use(flash())
   
      app.use(express.urlencoded({extended:true}))
      app.use(express.static(__dirname + '/assets/'));

//       check user logged in
function checkSignIn(req, res, next) {
          if (req.session.isAuth) {
              next();     //If session exists, proceed to page
          } else {
      
              res.redirect('/')
          }
      }
         






app.get('/',(req,res)=>{
          if(req.session.isAuth)
          {
          res.redirect('/home')
          }

else{
  
res.render('./login')
  
}
})

app.get('/signup',(req,res)=>{
if(!req.session.isAuth)
res.render('./signup')
else
res.redirect('./home')
})
app.get('/home',checkSignIn,(req,res)=>{
          res.render('home',{username:req.session.email})
})

app.get('/logout',(req,res)=>{
          req.session.isAuth = false
          req.session.destroy()
          res.redirect('/')
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



app.post('/signup',checkSchema(registrationSchema),async (req,res)=>{

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error','email exists')
   return res.redirect('/signup')
}
var hash = await bcrypt.hash(req.body.password,saltRounds) 

          const user = await model.insertMany([{
                    email:req.body.email,
                   
                    password:hash,
                    isadmin:0
          }])
         if(req.session.isAuth)
         {
         res.redirect('/home')
         }
         else
         {
         req.flash('success','registration success')
         res.redirect('/')
         }

         
})


app.post('/login',async (req,res)=>{



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
              return res.redirect('/');
            }
          
              
                    // check if the user exists 
                    const user = await model.findOne({ email: req.body.email }); 
                    const isMatch = await bcrypt .compare(req.body.password,user.password)
                    if (isMatch) { 
                     req.session.isAuth = true;
                     req.session.email = req.body.email

                      
                     res.redirect("/home")
                      } else { 
                   
                        res.redirect('/')
                      } 
                    
                  } catch (error) { 
                   
                    res.redirect('/')
                  } 
          
   
   })
         



app.listen(3000,()=>console.log('Server running'))
