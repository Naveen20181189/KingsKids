const express = require('express');
const app = express();
const http = require('http')
const multer = require('multer')
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const session = require('express-session')



// Initializing Firebase database
const admin = require('firebase-admin');
const credentials = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  
});
const db = admin.firestore();


// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'shhhh',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));


// Route to render the form
app.get("/",function(req, res) {
  res.render("register");
});
app.get("/Adminpanel",isLoggedIn,(req,res)=>{
  res.render("index")
})
app.get("/createdata",isLoggedIn,(req,res)=>{
  res.render("createdata")
})
// Route to handle form submission
app.post("/submit-form",async function(req, res) {
  try {
    
    const data = req.body;
    const docid = data.studentname;
    console.log(docid);
    const studentData = {
      
      status: data.status || null,
      studentname:data.studentname || null,
      studentid: data.studentid || null,
      dob:data.dob || null,
      caste:data.caste || null,
      religion: data.religion || null,
      gender: data.gender || null,
      education: data.education || null,
      healthcondition : data.healthcondition || null,
      healthreason:data.healthreason || null,
      previousschool:data.previousschool || null,
      schoolvillage:data.schoolvillage || null,
      siblings: data.siblings || null,
      fathername :data.fathername || null,
      mothername:data.mothername || null,
      fatheraadhar:data.fatheraadhar || null,
      motheraadhar:data.motheraadhar || null,
      studentaadhar:data.studentaadhar || null,
      studentvillage:data.studentvillage || null,
      studentmandal: data.studentmandal || null,
      studentdistrict :data.studentdistrict || null,
      studentpincode:data.studentpincode || null,
      admissionreason:data.admissionreason || null,
      admittedby:data.admittedby || null,
      admittervillage:data.admittervillage || null,
      admittermandal:data.admittermandal || null,
      admitterdistrict:data.admitterdistrict || null,
      admitterpincode:data.admitterpincode || null,
      admitterphone:data.admitterphone || null,
      relationship:data.relationship || null,
      emergencycontactname:data.emergencycontactname || null,
      emergencycontactphone:data.emergencycontactphone || null,
      emergencycontactvillage:data.emergencycontactvillage || null,
      emergencycontactmandal:data.emergencycontactmandal || null,
      emergencydist:data.emergencycontactdistrict || null,
      emerpin:data.emergencycontactpincode || null
    }
    
    const response = db.collection('users').doc(docid).set(studentData);
    console.log(response)
    res.redirect("/viewdata")
  } catch(error) {
    res.status(500).send(error);
  }
});
// app.post('/submit-img', upload.single('photo'), async (req, res) => {
//   const newStudentimg = new studentimg({
//     _id:studentname,
    
//     photo: {

//       data: req.file.buffer,
//       contentType: req.file.mimetype
//     }
//   });

//   await newStudentimg.save();
//   res.redirect('/viewdata');
// });

app.get("/viewdata",isLoggedIn, async (req,res)=>{
  try{
    
    const userref = db.collection('users');
    const responseref = await userref.get();
    let users = [];
    responseref.forEach(user =>{
      users.push(user.data());
    })
  
     
    

    
    res.render("viewdata",{users})
  
    
  }catch(e){
    console.log(e)
  }
})
// app.get("/viewdata:studentname", async (req,res)=>{
//   try{
    
//     const userref = db.collection('users');
//     const responseref = await userref.get();
//     let users = [];
//     responseref.forEach(user =>{
//       users.push(user.data());
//     })
//     console.log(users)
     
    
//     const students = await studentimg.find();
    
//     res.render("viewdata",{users})
    
//   }catch(e){
//     console.log(e)
//   }
// })
// Route to fetch specific student details by name
app.get("/viewdata/:studentname",isLoggedIn, async (req, res) => {
  const studentname = req.params.studentname;
  

  try {
    // Query Firestore for the specific student
    const userRef = db.collection('users').doc(studentname);
    
    const doc = await userRef.get();
    

    if (!doc.exists) {
      // Handle case where student is not found
      res.render("specificdata", { error: "Student not found" });
      return;
    }
  

    // Student data found, render the viewdata template with student details
    const userData = doc.data();

    // Render the viewdata template with student details
    res.render("specificdata", { usering: userData });
  


    // Render the viewdata template with student details
  
  
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.render("specificdata", { error: "Error fetching student details" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(err.message);
  }
  if (err) {
    return res.status(400).send(err.message);
  }
  next();
});
app.get("/update/:studentname",isLoggedIn,async (req,res)=>{
  const studentname = req.params.studentname;
  console.log(studentname)

  try {
    // Query Firestore for the specific student
    const userRef = db.collection('users').doc(studentname);
    const cod = await userRef.get();

    if (!cod.exists) {
      // Handle case where student is not found
      res.render("specificdata", { error: "Student not found" });
      return;
    }

    // Student data found, render the viewdata template with student details
    
  
    const datauser = cod.data();
    

    // Render the viewdata template with student details
    res.render("update", { user: datauser });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.render("specificdata", { error: "Error fetching student details" });
  }
})
app.post('/update-form/update/:studentname', async (req, res) => {
  const studentId = req.params.studentname;
  const updateData = req.body;
  console.log(updateData.studentname)

  try {
    // Retrieve the document from Firestore
    const studentRef = db.collection('users').doc(studentId);
    const doc = await studentRef.get();

    if (!doc.exists) {
      // Handle case where document does not exist
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the document with the new data
    const newDocRef = db.collection('users').doc(updateData.studentname);
    await newDocRef.set(updateData);

    await studentRef.delete();
    return res.redirect("/viewdata")
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ error: 'Failed to update student' });
  }
});



// app.get("/update/:studentname",async (req, res) => {
//   const docid = req.params.studentname;
//   console.log(docid);
//   try {
//     const userDoc = await db.collection('users').doc(docid).get();
//     if (!userDoc.exists) {
//       return res.status(404).send("User not found");
//     }
//     const users = userDoc.data();
//     res.render("update", { users });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error);
//   }
//   res.render("edit")
// });

// Route to handle the update form submission
// app.post("/update-form", async (req, res) => {
//   const updateno = req.body.studentname;
//   console.log("update:",updateno)
  
//   const responseref = await db.collection('users').doc(updateno).get();
  
//   if (!responseref.exists) {
//         return res.status(404).send("User not found");
//       }
//   console.log(responseref.studentname)
  
  
//     res.render("update");
  // const userData = {
  //   status: data.status || null,
  //   studentname: data.studentname || null,
  //   studentid: data.studentid || null,
  //   dob: data.dob || null,
  //   caste: data.caste || null,
  //   religion: data.religion || null,
  //   gender: data.gender || null,
  //   education: data.education || null,
  //   healthcondition: data.healthcondition || null,
  //   healthreason: data.healthreason || null,
  //   previousschool: data.previousschool || null,
  //   schoolvillage: data.schoolvillage || null,
  //   siblings: data.siblings || null,
  //   fathername: data.fathername || null,
  //   mothername: data.mothername || null,
  //   fatheraadhar: data.fatheraadhar || null,
  //   motheraadhar: data.motheraadhar || null,
  //   studentaadhar: data.studentaadhar || null,
  //   studentvillage: data.studentvillage || null,
  //   studentmandal: data.studentmandal || null,
  //   studentdistrict: data.studentdistrict || null,
  //   studentpincode: data.studentpincode || null,
  //   admissionreason: data.admissionreason || null,
  //   admittedby: data.admittedby || null,
  //   admittervillage: data.admittervillage || null,
  //   admittermandal: data.admittermandal || null,
  //   admitterdistrict: data.admitterdistrict || null,
  //   admitterpincode: data.admitterpincode || null,
  //   admitterphone: data.admitterphone || null,
  //   relationship: data.relationship || null,
  //   emergencycontactname: data.emergencycontactname || null,
  //   emergencycontactphone: data.emergencycontactphone || null,
  //   emergencycontactvillage: data.emergencycontactvillage || null,
  //   emergencycontactmandal: data.emergencycontactmandal || null,
  //   emergencycontactdistrict: data.emergencycontactdistrict || null,
  //   emergencycontactpincode: data.emergencycontactpincode || null,
  // };

  // try {
  //   await db.collection('users').doc(docid).update(userData);
  //   res.redirect("/viewdata");
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send(error);
  // }


app.delete("/delete/:docid",isLoggedIn,async (req,res)=>{
  const users = await db.collection('users').doc(req.params.docid).delete();
  res.redirect("/viewdata")
})

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const userRef = db.collection('access').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      email,
      password: hashedPassword,
    
    };

    // Save user to Firestore
    await userRef.set(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userRef = db.collection('access').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const userData = doc.data();
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ email: userData.email },"shhhhh", {
      expiresIn: '2h' // Token expires in 1 hour
    });

    // Set JWT as a cookie
    res.cookie('jwt', token, { httpOnly: true });

    res.redirect("/viewdata");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});
app.get('/logout', async (req, res) => {
  try {
    // Clear JWT cookie
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to log out' });
  }
});

// app.post("/register",isLoggedIn,async (req, res) => {
//   let { email, password } = req.body;

//   let user = await Usermongo.findOne({ email });
//   if (user) return res.status(500).send("User already registered");

//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(password, salt);
//   user = await Usermongo.create({
//     email,
//     password: hash
//   });

  
//   res.send("Registered successfully");
// });

// // Route to handle user login
// app.post("/login", async (req, res) => {
//   let { email, password } = req.body;

//   let user = await Usermongo.findOne({ email });
//   if (!user) return res.status(500).send("You don't have an account, please register");

//   const result = await bcrypt.compare(password, user.password);
//   if (result) {
//     const token = jwt.sign({ email: email, userid: user._id }, "shhhh");
//     res.cookie("token",token)
//     res.redirect("/homepage");
    
//   } else {
//     res.send("Email or password might be wrong");
//   }
// });

// // Route to handle logout
// app.get("/logout", (req, res) => {
//   Object.keys(req.cookies).forEach(cookieName => {
//     res.clearCookie(cookieName);
//   })
//   res.redirect("/");
// });

// Middleware to check if user is logged in\
// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  const token = req.cookies.jwt; // Use jwt instead of token

  if (!token) {
    return res.status(401).send("Please login"); // Adjust response as needed
  }

  try {
    const decoded = jwt.verify(token, "shhhhh"); // Verify the JWT token
    req.user = decoded; // Attach user information to request object
    next(); // Move to the next middleware
  } catch (err) {
    console.error(err);
    return res.status(403).send("Invalid token"); // Adjust response as needed
  }
}



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
