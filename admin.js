const express = require('express');
const session = require('express-session');
const router = express(); // Use express.Router()
const model = require('./models/usermodel');
const path = require('path')

router.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
router.set('view engine','ejs')
router.set('views', path.join(__dirname, 'views'));
router.use(
    session({
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
        saveUninitialized: false,
        resave: false,
    })
);



router.use(express.urlencoded({ extended: true }));
router.use(express.static(__dirname + '/assets/'));

// Check if the user is logged in

function checkLogIn(req, res, next) {
    if (req.session.isAuth) {
        next(); 
    } else {
        res.redirect('/');
    }
}

router.get('/', (req, res) => {
    if (req.session.isAuth)
    { res.redirect('/adminhome');
}
    else
    { 
          res.render('./adminlogin');
    }
});

router.get('/adminhome', checkLogIn, (req, res) => {
     
    res.render('adminhome');
});





router.get('/logout', (req, res) => {
    req.session.isAuth = false;
    req.session.destroy();
    res.redirect('/');
});

router.post('/adlogin',async (req,res)=>{


      
                    // check if the user exists 
                    const user = await model.findOne({ email: req.body.email }); 
                    if(user.isadmin==1){
                    if (user.password == req.body.password) { 

                     req.session.isAuth = true;
                    res.redirect('/adminhome')
                      console.log("success")
                    
                      } else { 
                              console.log("failed")
                      
                        res.redirect('/')
                      } 
                    }else{
                              res.redirect('/')
                    }
                    
              
   
   })




module.exports = router;
