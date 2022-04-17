const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = "this_is_a_secret";


// register user via http://localhost:5000/api/auth/createUser api
router.post('/createUser',
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 8 }),
  async (req, res)=>{
   // on encountering errors return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    
    // checks whether user with email already exists
    try {
    let user = await Users.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({error: "Email already exists"})
    }
    //creates salt and hash
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    
    // if email not exists then new user is created
    user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
      
      
    //   .then(user => res.json(user))
    //   .catch(err=> {console.log(err)
    // res.json({error: "Enter a valid unique email",message: err.message})});

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken});
  }
  // catch errors 
  catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured")
  }
})

// authenticate user via http://localhost:5000/api/auth/login api
router.post('/login',
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
  async (req, res)=>{
   // on encountering errors return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {email, password} = req.body;
    
    // checks whether user with email already exists
    try {
    let user = await Users.findOne({email: req.body.email});
    if(!user){
      return res.status(400).json({error: "Invalid credentials"})
    }

    // compares the password with the hash
    const passCompare = await bcrypt.compare(password, user.password);
    if(!passCompare){
      return res.status(400).json({error: "Invalid credentials"})
    }

    // sends authtoken if valid credentials
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken});
  }
  // catch errors 
  catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error")
  }
})

// get user details via http://localhost:5000/api/auth/getuser api
router.post('/getuser', fetchUser, async (req, res)=>{
    // returns user details if valid authtoken
  try {
      userId = req.user.id;
      const user = await Users.findById(userId).select("-password");
      res.send(user);
  }
  // catch errors 
  catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error")
  }
})

module.exports = router;