const express = require('express');
const session = require('express-session');
const router = express.Router(); // Use express.Router()
const model = require('../models/usermodel');
const flash = require('express-flash')
const {checkSchema,validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const sessionmiddleware = require('../session')




router.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});


router.use(sessionmiddleware)

function checkIn(req, res, next) {
    if (req.session.isIn) {
       
        next(); 
      
    } else {
        res.redirect('/admin//');
    }
}


router.use(flash())

router.use(express.urlencoded({ extended: true }));
router.use(express.static(__dirname + '/assets/'));

// Check if the user is logged in



router.get('/', (req, res) => {
    if (req.session.isIn)
    { res.redirect('/admin/adminhome');
}
    else
    { 
          
          res.render('./adminlogin');
    }
});



router.post('/adlogin',async (req,res)=>{


  try {

    const { email, password } = req.body;
    let admin = false; 

    if (email.length < 1) {
      req.flash('error', 'Email required');
      return res.redirect('/admin/');
    } else if (password.length < 1) {
      req.flash('error', 'Password required');
      return res.redirect('/admin/');
    }

    const user = await model.findOne({ email: req.body.email });
    if (!user) {
      // Handle the case where the user is not found
      req.flash('error', 'User not found');
      res.redirect('/admin//');
      return; // Return early to exit the function
    }
  
    if (user.isadmin == 1) {
      admin = true;
    } else {
      req.flash('error', 'Not an admin');
      res.redirect('/admin//');
      return; // Return early to exit the function
    }
  
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch && admin) {
      req.session.isIn = true;
      res.redirect('/admin/adminhome');
     
    } else {
      console.log("Failed");
      req.flash('error', 'Invalid login credentials');
      res.redirect('/admin//');
    }
  } catch (error) {
    req.flash('error', 'Invalid input');
    res.redirect('/admin//');
  }
               
                
          

})



router.get('/adminhome', checkIn,async (req, res) => {
   if(req.session.isIn){
    res.render('./adminhome')
   }
});


// db operations






router.get('/view',async (req, res) => {
  
    try {
        if(req.session.isIn){
        const user = await model.find({});
        res.render('view', { user: user });
        }
        else{
            res.redirect('/admin/adminhome');
        }
    }
   catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/edit/:id',async (req, res) => {
    const userId = req.params.id;

    try {
        if(req.session.isIn){
        const user = await model.findById(userId);
        res.render('edit', { user: user });
        }else{
            res.redirect('/admin/adminhome');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// update post

// update email redundancy

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


router.post('/update/:id', async (req, res) => {
    const userId = req.params.id;
    const {email,firstname,lastname,phonenumber,password} = req.body
    
    try {
        if(req.session.isIn){
        if (!email || !password) {
           
            req.flash('error', 'Email and password cannot be empty');
            return res.redirect(`/admin/edit/${userId}`);
        }
        var hash = await bcrypt.hash(password,saltRounds) 
        const updatedUser = await model.findByIdAndUpdate(userId, { email, password : hash,firstname,lastname,phonenumber });
        res.redirect('/admin/view');
    }else{
        res.redirect('/admin/adminhome');
    }
    } catch (error) {
        req.flash('error','some problem occured while creating')
       res.redirect(`/admin/edit/${userId}`)
    }
});


// add user
router.get('/add', async (req, res) => {
  

if(req.session.isIn){
    
        res.render('add');
}else{
    res.redirect('/admin/adminhome');

}
    
});
router.get('/error',(req,res)=>{

   
})

router.post('/added', checkSchema(registrationSchema),  async (req, res) => {
    try {
        if(req.session.isIn){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', 'Email already exists');
            return res.redirect('/admin/add');
        }

        const {email,firstname,lastname,phonenumber,password} = req.body

        if (!email || !password) {
            req.flash('error', 'Email and password cannot be empty');
            return res.redirect('/admin/add');
        }

        // Hash the password
        var hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user with the hashed password
        const user = await model.insertMany([{ email: email, password: hashedPassword,firstname,lastname,phonenumber }]);

        // Check if user is created
        if (user) {
            res.redirect('/admin/view');
        } else {
            req.flash('error', 'User creation failed');
            res.redirect('/admin/add');
        }
    }
    else
    {
        res.redirect('/admin/adminhome');
    }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while creating the user');
        res.redirect('/admin/add');
    }
});





router.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        if(req.session.isIn){
        const user = await model.findByIdAndDelete(userId);
        res.redirect('/admin/view');
        }else{
            res.redirect('/admin/adminhome');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// search

router.get('/search',  async (req, res) => {
    const searchTerm = req.query.searchTerm;

    try {
        if(req.session.isIn){
        if (searchTerm) {
           
            const searchFiltered = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
            const searchres = await model.find({
                email: { $regex: new RegExp(searchFiltered, 'i') },
            });

            res.render('./search', { searchres });
        } else {
           
            res.render('./search');
        }
    }else
    {
        res.redirect('/admin/adminhome');
    }
    } catch (error) {
        console.log(error);
    }
});


router.post('/search',  (req, res) => {
   if(req.session.isIn){
    const searchTerm = req.body.searchTerm;

    // Redirect to  search route with the search term as a query parameter
    res.redirect('/admin/search?searchTerm=' + searchTerm);
   }
   else
   {
    res.redirect('/admin/adminhome');
   }
});










   
   router.get('/logout', (req, res) => {
    req.session.isIn = false;
    req.session.destroy();
    res.redirect('/admin//');
});






module.exports = router;
