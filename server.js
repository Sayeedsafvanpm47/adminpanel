const express = require('express')
const model = require('./models/usermodel')
const path = require('path')
const flash = require('express-flash')
const app = express()
const adminrouter = require('./routes/admin')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const sessionmiddleware = require('./session')
const {body,checkSchema,validationResult,check} = require('express-validator')
const { error } = require('console')
const { name } = require('ejs')
const { v4: uuidv4 } = require('uuid');

app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});



// app.use(flash())
app.use(sessionmiddleware)
app.use('/admin',adminrouter)




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
res.redirect('/home')
})
app.get('/home',checkSignIn,(req,res)=>{
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



app.post('/signup',checkSchema(registrationSchema),async (req,res)=>{
try{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error','email exists')
   return res.redirect('/signup')
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
  return res.redirect('/signup');
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
     
    


         req.flash('success','registration success')
         res.redirect('/')
        }catch {
          req.flash('success','registration failed')
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
                    const isMatch = await bcrypt.compare(req.body.password,user.password)
                    if (isMatch) { 
                     req.session.isAuth = true;
                     req.session.email = req.body.email

                      
                     res.redirect("/home")
                      } else { 
                         req.flash('error','invalid login credentials')
                        res.redirect('/')
                      } 
                    
                  } catch (error) { 
                    req.flash('error','invalid login credentials')
                    res.redirect('/')
                  }
          
   
   })

   app.get('/posts', async (req, res) => {
    if (req.session.isAuth) {
      try {
        const user = await model.findOne({ email: req.session.email });
        if (user) {
          res.render('postview', { username: req.session.email, posts: user.posts });
        } else {
          res.redirect('/home');
        }
      } catch (error) {
        console.error(error);
        res.redirect('/home');
      }
    } else {
      res.redirect('/');
    }
  });


  
  

  app.post('/deletepost', async (req, res) => {
    try {
      const userEmail = req.session.email;
      const postId = req.body.postId;
  
      const updatedUser = await model.findOneAndUpdate(
        { email: userEmail },
        { $pull: { posts: { id: postId } } },
        { new: true }
      );
  
      if (updatedUser) {
        res.redirect('/posts');
      } else {
        res.redirect('/home');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/home');
    }
  });
  


app.post('/posted', async (req, res) => {
  try {
    const postId = uuidv4(); // Generate a unique post ID
    const user = await model.findOne({ email: req.session.email });
    if (user) {
      // Create an object for the post
      const newPost = {
        id: postId,
        content: req.body.txt
      };

      user.posts.push(newPost); // Push the object into the "posts" array
      await user.save();
      res.redirect('/posts');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/home');
  }
});





   app.get('/logout',(req,res)=>{
    req.session.isAuth = false
    req.session.destroy()
    res.redirect('/')
})





app.listen(3000,()=>console.log('Server running'))
