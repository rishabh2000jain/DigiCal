const express=require('express');
const bodyParser=require("body-parser");
const cors=require("cors");
 var multer = require('multer')
var fs = require('fs');
const path = require('path');
let bcrypt = require('bcrypt');
let saltRounds = 10;
const jwt=require('jsonwebtoken');
const SK="Deep2323";

// extra requriement

//extra requriement
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));




  // CONNECTION OF MONGOOSE DATA BASEC TO THE SERVER
  const{ObjectId}=require('mongodb')
  const MongoClient =require('mongodb').MongoClient;
const console = require('console');
  let client=new MongoClient(
      "mongodb://localhost:27017/digical",
      {useNewUrlParser:true, useUnifiedTopology: true}
  );
  
  let mddbconn;
  client.connect((err,db)=>{
  if(!err)
  {
      mydb=db;
      console.log("connected")
  }
  else{
      console.log("db could not be connected");
  }
  });

//connecting to a file system to upload the image
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'Userimage/')
  },
  filename: function (req, file, cb) {
    console.log("Llllllllllllllllllllllllllllll")
    console.log(file)
    cb(null, "temp.jpg")
}
})
// Make storage for report
var reportstorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'Report/')
  },
  filename: function (req, file, cb) {
    console.log("Llllllllllllllllllllllllllllll")
    console.log(file)
    cb(null, "temp.jpg")
}
})
var upload = multer({ storage: storage })
app.use(express.static(__dirname + '/Userimage'))
var reportupload= multer({ storage: reportstorage })
app.use(express.static(__dirname + '/Report'))
//routes ARE THERE
// 1:Login OF ALL THE USER
app.post('/login',bodyParser.json(),(req,res)=>{
  // console.log(req.body)
 const{email,password}=req.body;
 if(!email || !password) return res.status(422)
 
 let search=mydb.db('digical').collection('users');
 search.find({email:email}).toArray((err,docs)=>{
     if(!err && docs.length>0){
       console.log(docs)
        bcrypt.compare(password, docs[0].password, function(err, result) {
           if(result){
             console.log(docs[0]._id)
             const user={
               id:docs[0]._id,
             }
             jwt.sign({user},SK,(err,token)=>{
               if(!err){
               // {res.status(200).json({token})
                 res.send({status:"ok",token:token,docs:docs})  
             }
               else{res.status(402)}
             })
            
         
           }
           else{
             res.send({status:"401"}) 
         }
     
       });
            
       
     }
     else{
       res.send({status:"sry",message:"please enter write info"})
     }    })
})
// 2:Signup Routes TO THE USER
app.post('/signup', upload.array('file'), (req, res)=>{
  // console.log(req.body); 
 const {email,password} =req.body 
 bcrypt.hash(password, saltRounds, function(err, hash) {
     if(!err){
         req.body.password=hash
         let user=mydb.db('digical').collection('users');
         user.find({email:email}).toArray((err,docs)=>{
         console.log("in find")
             if(!err && docs.length>0){
                 res.json({
                     status:"300",
                     message:"USER ALREADY EXISTS"
                 });
             }
             else {
                 user.insertOne(req.body,(err,r)=>{
                     console.log("in insert")
                     if(!err){ 
                         fs.renameSync('./Userimage/temp.jpg', './Userimage/' + r.insertedId+'.jpg');
                         // res.send({ msg: "imge sucessfully inserted", status: 'OK', description: 'img detail created and file uploaded' });
                   
                       res.send({status:"ok"})
                         
                     

                         
                     }
                     else{
                         res.json({
                             status:"401"
                         })
                     }
                 })
             }
             
         })
       }
 });
 })

// End of all signup
// Send User
app.get('/senduser', (req, res) => {

  const collection = mydb.db('digical').collection('users');

  collection.find().toArray(function (err, docs) {
    // console.log(docs)
    
      res.send(docs);
  });

})

// send docto of given id
app.post('/senddoctor',bodyParser.json(),(req,res)=>{

  var ids=req.body.id
  console.log(ids)
  let user=mydb.db('digical').collection('users');
 
  user.find({_id:ObjectId(req.body.id)}).toArray((err,docs)=>{
   
    
    if(!err &&docs.length>0){
    
      res.send({status:"ok",docs:docs})
    }
    else{
      res.send({message:"sry no docs found"})
    }
  })
  
})
// app.post('/ordermedicine',bodyParser.json(),(req,res)=>{
// console.log(req.body)
//   var ids=req.body.id
//   console.log(ids)
//   let user=mydb.db('digical').collection('medicine-orders');
 
//   user.find({_id:ObjectId(req.body.id)}).toArray((err,docs)=>{
   
    
//     if(!err &&docs.length>0){
    
//       res.send({status:"ok",docs:docs})
//     }
//     else{
//       res.send({message:"sry no docs found"})
//     }
//   })
  
// })
// 4:order of medicine
app.post('/medicineordwers', upload.array('file'),(req,res)=>{
  console.log(req.body)
  let appoinment=mydb.db('digical').collection('medicine-orders');
appoinment.insertOne(req.body,(err,r)=>{
  if(!err){
    fs.renameSync('./Userimage/temp.jpg', './Userimage/' + r.insertedId+'.jpg');
    res.send({status:"ok"})
  }
  else res.send({status:"sorry"})
})

})
//4.2 lab Test orderas
app.post('/Labtestbook', upload.array('file'),(req,res)=>{
  console.log(req.body)
  let appoinment=mydb.db('digical').collection('labtest');
appoinment.insertOne(req.body,(err,r)=>{
  if(!err){
    fs.renameSync('./Userimage/temp.jpg', './Userimage/' + r.insertedId+'.jpg');
    res.send({status:"ok"})
  }
  else res.send({status:"sorry"})
})

})
// 5: All the appoinment that has been boooked by the user
app.post('/appoin',bodyParser.json(),(req,res)=>{
  console.log(req.body)
  let appoinment=mydb.db('digical').collection('appoinment');
appoinment.insertOne(req.body,(err,r)=>{
  if(!err){
   
    res.send({status:"ok"})
  }
  else res.send({status:"sorry"})
})

})
// 7:data of the medicin store
app.get('/sendmedicineoder', (req, res) => {

  const collection = mydb.db('digical').collection('medicine-orders');

  collection.find().toArray(function (err, docs) {
    
    
      res.send(docs);
  });

})
 // // SERVER IS LISTEN ON ANY PORT
 app.listen(80,()=>{console.log("serveris runnig at 80")})