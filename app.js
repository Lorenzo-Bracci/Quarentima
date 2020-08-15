var Recommendation = require('./recommendation.js');
var recommendation = Recommendation.Recommendation;
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(cors());
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/test', {useMongoClient: true});
let db = mongoose.connection;
let ObjectID = require('mongodb').ObjectID
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("success");
});

var Schema = mongoose.Schema;

var userRatings = new Schema({ 
    email: String,
    average: Number,
    ratings: [{movieId: Number, rate: Number}],
    newratings: Number
});

var resources = new Schema( { 
    MoviesLength:Number,
    UsersLength:Number,
    Type: String,
    Dataset: []
});

var newMovies = new Schema( {
    movieId: Number,
    counter: Number,
    ratings:[{email:String,rate:Number}]
})
var userData = new Schema({ 
    email: String,
    icon: String,
    topic: [{title: String, color: String, movieIDs: []}],
    reccomendations: [],
    takenSurvey: Boolean
});

var UserData = mongoose.model('UserData', userData);
var NewMovies = mongoose.model('NewMovies',newMovies);
var Resources = mongoose.model('Resources', resources);
var UserRatings = mongoose.model('UserRatings', userRatings);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/QuarenTimeLeo/dist/QuarenTime'));



app.get('/*', (req,res) => res.sendFile(path.join(__dirname)));

const server = http.createServer(app);

server.listen(port,() => console.log( "this compiles!"));

app.get('/get-users', function(req, res, next){
    var results = [];
    db.collection("UserRatings").find({}).toArray().then(function(doc){
		doc.forEach(element => { 
                results.push(element.email);})
                res.json(results);
		});
             
});

app.get('/user', function(req,res,next) { 
    let query = req.query.email;

    db.collection("UserRatings").findOne({email: query}).then(function(doc){                                               //how to find elements in mongodb
        res.json(doc);
    });
})


app.post('/user-add', function(req,res) {
    console.log(req.body);
     let user =  new UserRatings({email: req.body.email, average: req.body.average, ratings: req.body.ratings,newratings: 0});
     db.collection("Resources").findOne({Type: 'movies'}).then(elem => {
        db.collection("Resources").updateOne({Type:'movies'}, {$set:  {UsersLength: elem.UsersLength + 1}});
    })
    db.collection("UserRatings").insertOne(user, function (err, results) {                                                                                                                           //how to insert users into mongodb
            res.json(results);
    });
})

app.get('/compute-recommendation', function(req,res,next) { 
	let query = req.query.email;
    recommendation.recommend(query);
    res.send("okay");
})

app.get('/translation', function(req,res,next) { 
    db.collection("Resources").findOne({Type:'movies'}).then(result => { 
            res.send(result.Dataset); });
})


app.get('/get-length', function(req,res){ 
    db.collection("Resources").findOne({Type:'movies'}).then(result=> {
        var lengths = [result.MoviesLength, result.UsersLength];
        res.send(lengths);
    })
})

app.post('/rate-movie', function(req,res,next) { 
    let rating= req.body.rating;
    let useremail = req.body.email;
    let usermovie = req.body.movie;
    db.collection("UserData").updateOne(//erase the movie that has been rated from the reccomendations (if it isn t there nothing will happen)
      { email: useremail},//find our current user
      { $pull:  { reccomendations: Number(usermovie) } },//remove the movie that the user rated from the reccomendations
      { multi: false });

    

    db.collection("Resources").findOne({Type: 'movies'}).then(doc=>{
        var inDataset = false; 
        
            if(isIncluded(doc.Dataset,usermovie)) {
          
               
                inDataset=true;
                let done = false;
                db.collection("UserRatings").findOne({email: useremail}).then(userdoc => { 
                    let length = userdoc.ratings.length;
                    let avg = userdoc.average;
                    let ratingsCounter = userdoc.newratings;
                    
                    userdoc.ratings.forEach( userratings=> {
                        if(userratings.movieId === doc.Dataset.indexOf(Number(usermovie))){
                            done = true;
                            
                            let sum = ((avg*length) - userratings.rate) + Number(rating);
                            let newavg = sum/length;
                            
                            
                            db.collection("UserRatings").updateOne({email: useremail},{$set:{average: newavg}});
                            db.collection("UserRatings").updateOne({email: useremail,"ratings.movieId": doc.Dataset.indexOf(Number(usermovie))},{$set:{"ratings.$.rate": Number(rating)}});
                            
                            if(ratingsCounter > 9){ 
                                db.collection("UserRatings").updateOne({email:useremail},{$set:{newratings:0}});
                            }
                                res.json(JSON.stringify(ratingsCounter));
                        }    
                    })
                    
                    if(!done) {
                        let sum2 = (avg*length) + Number(rating);
                        let movierating = {movieId: doc.Dataset.indexOf(Number(usermovie)), rate: Number(rating)}
                        let newavg2 = sum2/(length+1);
                       
                        db.collection("UserRatings").updateOne({email: useremail},{$set:{average: newavg2}});
                                                                                                                  //dataset=translation
                        db.collection("UserRatings").updateOne({email: useremail},{$push: {ratings: movierating}});     
                        db.collection("UserRatings").updateOne({email: useremail},{$inc: {newratings: 1}} );
                        let currentratings = ratingsCounter+1;
                      
                        if(currentratings > 9){
                            db.collection("UserRatings").updateOne({email:useremail},{$set:{newratings:0}});
                        }
                        res.json(JSON.stringify(currentratings));              
                    }
                })
               
            }

            if(!inDataset) { 
               db.collection("NewMovies").findOne({movieId: Number(usermovie)}).then((doc) => {
                   if(doc == null){
                       
                        let newmovie  =  new NewMovies({movieId: usermovie, counter: 1, ratings:[{email:useremail,rate:rating}]});
                        db.collection("NewMovies").insertOne(newmovie, function(err,results) {});
                        res.json("0");
                   }
                   else { 
                       if(doc.counter == 5) {
                            db.collection("NewMovies").remove({movieId: doc.movieId});
                            db.collection("Resources").findOne({Type: 'movies'}).then(elem => { 
                                var newID = elem.MoviesLength;
                                let userNewRatings = 0;
                                db.collection("UserRatings").findOne({email:useremail}).then(userelem => { 
                                    let sum = (userelem.average*userelem.ratings.length) + Number(rating);
                                    let newavg = sum/(userelem.ratings.length+1);
                                    userNewRatings = userelem.newratings+1;

                                    db.collection("UserRatings").updateOne({email: useremail},{$push: {ratings: {movieId:newID, rate: Number(rating)}} });
                                    db.collection("UserRatings").updateOne({email: useremail},{$set: {average:newavg} });
                                    db.collection("UserRatings").updateOne({email: useremail},{$inc:{newratings: 1}});
                                 
                                })
                                    
                                
                                for(let i = 0; i < doc.ratings.length; i++){
                                    db.collection("UserRatings").findOne({email: doc.ratings[i].email}).then(result => {
                                        console.log(result.ratings); 
                                        let sum = ((result.average)*result.ratings.length) + doc.ratings[i].rate;
                                        let newavg = sum/(result.ratings.length + 1);
                                        
                                        db.collection("UserRatings").updateOne({email: doc.ratings[i].email},{$set:{average:newavg}});
                                        db.collection("UserRatings").updateOne({email: doc.ratings[i].email},{$push: {ratings: {movieId:newID, rate: doc.ratings[i].rate}} });
                                        db.collection("UserRatings").updateOne({email: doc.ratings[i].email},{$inc:{newratings: 1}});
                                    })    
                                   
                                }    
                            
                                db.collection("Resources").updateOne({Type:'movies'}, {$set:  {MoviesLength: elem.MoviesLength + 1}});
                                db.collection("Resources").updateOne({Type:'movies'},{$push: {Dataset: Number(usermovie)}});
                                if(userNewRatings > 9){
                                    db.collection("UserRatings").updateOne({email:useremail},{$set:{newratings:0}});
                                }
                                    res.json(JSON.stringify(userNewRatings));
                            })
                            
                       }
                       else {
                           let found = false;
                           for(let indx = 0; indx < doc.ratings.length;indx++){
                               if(doc.ratings[indx].email === useremail) {
                                   console.log("user found");
                                    found = true;
                                    db.collection("NewMovies").updateOne({movieId: Number(usermovie),"ratings.email": useremail},{$set:{"ratings.$.rate": Number(rating)}});
                                    break;
                               }
                           }
                           if(!found) {
                                db.collection("NewMovies").updateOne({movieId: Number(usermovie)},{$set:{counter:doc.counter + 1}} );
                                db.collection("NewMovies").updateOne({movieId: Number(usermovie)},{$push:{ratings:{email:useremail, rate:Number(rating)}} });
                           }
                           res.json("0");
                       }
                   }
               })
            }
        
    })
  

})

function isIncluded(array, element){
    return array.some(e => e == element);
}


app.get('/init-user', function(req, res, next){ //HERE I AM WRITING CODE(TO INITIALIZE AN USER)
    let user =  new UserData({email: req.query.email, icon: '0x1F606', topic: [{title: 'Watch List', color: '#FFC857', movieIDs: []}, {title: 'Favourite', color: '#E9724C', movieIDs: []},
    {title: 'Black List', color: '#C5283D', movieIDs: []}, {title: 'Watched', color: '#255F85', movieIDs: []}], reccomendations: [], takenSurvey: false});

    db.collection("UserData").insertOne(user, function (err, result) {
    if (err){
        res.sendStatus(400);//send error message BAD REQUEST
    } 
    else {
        res.sendStatus(200);//send OK message
    }
    });
}); //HERE I FINISH WRITING CODE


app.post('/store-recommendation', function(req, res) {//MORE NEW CODE(TO STORE ALL THE RECOMMENDED MOVIES)
    db.collection("UserData").updateOne({email: req.body.email}, {$set:  {reccomendations: req.body.ratings,takenSurvey: true}}, function (err, result) {
    if (err){
        res.sendStatus(400);//send error message BAD REQUEST
    }   
    else {
        
        res.sendStatus(200);//send OK message
    }
    });
});//HERE I FINISH TO WRITE MORE NEW CODE
    
app.get('/add-topic', function(req, res, next){ //HERE I AM WRITING CODE TO ADD A NEW TOPIC(PRE-DEFINED FORMAT)
    db.collection("UserData").updateOne({email: req.query.email}, {$push: {topic: {title: 'My List', color: '#9ed964', movieIDs: [], _id:new ObjectID()} }}, function (err, result) {
    if (err){
        res.sendStatus(400);//send error message BAD REQUEST
    }
    else {
        res.sendStatus(200);//send OK message
    }
    });
}); //HERE I FINISH WRITING CODE
    

app.get('/delete-topic', function(req, res, next){ //HERE I AM WRITING CODE TO DELETE A TOPIC
      db.collection("UserData").findOne({email: req.query.email}).then(doc=>{
        let id = doc.topic[req.query.index]._id;//get the id of the correct element in the array
      db.collection("UserData").updateOne(
        { email: doc.email},//find our current user
        { $pull:  { topic: {  _id: id } } },//remove the topic with the correct id(with found the correct id given the idex when we initialize the variable id)
        { multi: false }, //this means that we only want to remove one element
        function (err, result) {
      if (err){
        res.sendStatus(400);//send error message BAD REQUEST
      }else{
          res.sendStatus(200);//send OK message
      }
        })
      });
    }); //HERE I FINISH WRITING CODE
    
    app.get('/load-list', function(req, res, next){//NEW CODE TO LOAD ALL THE USER DATA FOR A SPECIFIED EMAIL
      db.collection("UserData").findOne({email: req.query.email}).then(doc=>{
        res.json(doc);//send json file back to client
      });
    });// HERE I FINISH WRITING NEW CODE
    
    app.get('/update-icon', function(req, res) {//MORE NEW CODE TO UPDATE AN ICON
      db.collection("UserData").updateOne({email: req.query.email}, {$set:  {icon: req.query.icon}}, function (err, result) {//UPDATE ICON
    if (err){
      res.sendStatus(400);//send error message BAD REQUEST
    }else{
        res.sendStatus(200);//send OK message
    }
      });
    });//HERE I FINISH TO WRITE MORE NEW CODE
    
    app.get('/delete-movie-from-topic', function(req, res, next){ //HERE I AM WRITING CODE TO A MOVIE FROM A TOPIC(I NEED THE EMAIL, THE TOPIC INDEX, THE MOVIEID AND THEN I CAN REMOVE THE MOVIE FROM THE LIST)
        db.collection("UserData").findOne({email: req.query.email}).then(doc=>{
          let id = doc.topic[req.query.index]._id;//get the id of the correct element in the array
        db.collection("UserData").updateOne(
          { email: doc.email, "topic._id": id},//find our current user
          { $pull:  { "topic.$.movieIDs": Number(req.query.movieID) } },//remove the topic with the correct id(with found the correct id given the idex when we initialize the variable id)
          { multi: false }, //this means that we only want to remove one element
          function (err, result) {
        if (err){
          res.sendStatus(400);//send error message BAD REQUEST
        }else{
            res.sendStatus(200);//send OK message
        }
          })
        });
      }); //HERE I FINISH WRITING CODE
      //db.collection("UserRatings").update({email: useremail},{$push: {ratings: movierating}});
      app.get('/add-movie-to-topic', function(req, res, next){//HERE I WRITE CODE TO ADD A NEW MOVIE TO AN EXISTING TOPIC GIVEN THE INDEX, THE MOVIEID AND THE EMAIL
        db.collection("UserData").findOne({email: req.query.email}).then(doc=>{
          let id = doc.topic[req.query.index]._id;//get the id of the correct element in the array
        db.collection("UserData").updateOne( { email: doc.email, "topic._id": id}, { $push:  { "topic.$.movieIDs": Number(req.query.movieID) } },
          function (err, result) {
        if (err){
          res.sendStatus(400);//send error message BAD REQUEST
        }else{
            res.sendStatus(200);//send OK message
        }
          })
        });
      });// HERE I FINISH WRITING CODE

      app.get('/update-topic', function(req, res, next){
        db.collection("UserData").findOne({email: req.query.email}).then(doc=>{
          let id = doc.topic[req.query.index]._id;//get the id of the correct element in the array
          console.log(req.query.color);
          console.log(req.query.title);
        db.collection("UserData").updateOne( { email: doc.email, "topic._id": id}, { $set:  { "topic.$.title": req.query.title,  "topic.$.color": req.query.color} },
          function (err, result) {
        if (err){
          res.sendStatus(400);//send error message BAD REQUEST
        }else{
            res.sendStatus(200);//send OK message
        }
          })
        });
        });

/*app.get('/', function(req, res){
	res.send("Hello world");
	});
	
	app.listen(3003, function(){
		console.log('Server started');
		});*/

/*var fs = require('fs');//code to add dataset
var all = fs.readFileSync('array.txt', 'utf8');
all = all.trim();  // final crlf in file
let numbers = all.split(",").map(Number);

 let user =  new Resources({MoviesLength:9742, UsersLength:610, Type:'movies', 
	 Dataset:numbers});
    db.collection("Resources").insert(user, function (err, results) {                                 //how to insert users into mongodb
        console.log("new data inserted");
    });*/
