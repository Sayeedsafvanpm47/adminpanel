const express = require('express');
const session = require('express-session');
const router = express.Router(); // Use express.Router()
const model = require('../models/usermodel');
const flash = require('express-flash')
const {checkSchema,validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
const saltRounds = 10;




router.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

router.use(
    session({
        secret: "thisismysecrctekey",
        saveUninitialized: false,
        resave: false,
    })
);

router.use(flash())

router.use(express.urlencoded({ extended: true }));
router.use(express.static(__dirname + '/assets/'));

// Check if the user is logged in
function checkLogIn(req, res, next) {
    if (req.session.isIn) {
       
        next(); 
      
    } else {
        res.redirect('/admin//');
    }
}


router.get('/', (req, res) => {
    if (req.session.isIn)
    { res.redirect('/admin/adminhome');
}
    else
    { 
          
          res.render('./adminlogin');
    }
});

router.get('/adminhome', checkLogIn, (req, res) => {
     
    res.render('./adminhome');
});


// db operations


function checkIn(req, res, next) {
    if (req.session.isIn) {
       
        next(); 
      
    } else {
        res.redirect('/admin/adminhome');
    }
}



router.get('/view', checkIn,async (req, res) => {
    try {
       
        const user = await model.find({});
        res.render('view', { user: user });
        }
   catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/edit/:id',checkIn,async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await model.findById(userId);
        res.render('edit', { user: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// update post

// update email redundancy

const registrationSchema = {
    email: {
      normalizeEmail: true,
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


router.post('/update/:id', checkIn, async (req, res) => {
    const userId = req.params.id;
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        if (!email || !password) {
            // If either email or password is empty, show an error message and redirect back to the edit page.
            req.flash('error', 'Email and password cannot be empty');
            return res.redirect(`/admin/edit/${userId}`);
        }

        const updatedUser = await model.findByIdAndUpdate(userId, { email, password });
        res.redirect('/admin/view');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// add user
router.get('/add',checkIn, async (req, res) => {
  


    
        res.render('add');
    
});
router.get('/error',(req,res)=>{

   
})

router.post('/added', checkSchema(registrationSchema),checkIn, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          req.flash('error','email exists')
         return res.redirect('/admin/add')
      }
    


        if (!req.body.email) {
            req.flash('error', 'Email cannot be empty');
            return res.redirect('/admin/add');
        }

        if (!req.body.password) {
            req.flash('error', 'Password cannot be empty');
            return res.redirect('/admin/add');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = await model.create({ email: req.body.email, password: hashedPassword });
        res.redirect('/admin/view');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while creating the user');
        res.redirect('/admin/add');
    }
});




router.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await model.findByIdAndDelete(userId);
        res.redirect('/admin/view');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





router.get('/logout', (req, res) => {
    req.session.isIn = false;
    req.session.destroy();
    res.redirect('/admin//');
});

router.post('/adlogin',async (req,res)=>{


      
                    // check if the user exists 
                    const user = await model.findOne({ email: req.body.email }); 
                    if(user.isadmin==1){
                    if (user.password == req.body.password) { 

                     req.session.isIn = true;
                    res.redirect('/admin/adminhome')
                      console.log("success")
                    
                      } else { 
                              console.log("failed")
                      
                        res.redirect('/admin//')
                      } 
                    }else{
                              res.redirect('/admin//')
                    }
                    
              
   
   })

   router.get('/search', checkIn, async (req, res) => {
    const searchTerm = req.query.searchTerm;

    try {
        if (searchTerm) {
           
            const searchFiltered = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
            const searchres = await model.find({
                email: { $regex: new RegExp(searchFiltered, 'i') },
            });

            res.render('./search', { searchres });
        } else {
           
            res.render('./search');
        }
    } catch (error) {
        console.log(error);
    }
});


router.post('/search', checkIn, (req, res) => {
   
    const searchTerm = req.body.searchTerm;

    // Redirect to  search route with the search term as a query parameter
    res.redirect('/admin/search?searchTerm=' + searchTerm);
});








module.exports = router;
