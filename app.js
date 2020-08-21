var Recommendation = require('./recommendation/recommendation.js');
const fetch = require("node-fetch");
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
mongoose.connect('mongodb://admin:tcomkleo@172.30.191.158:27017/sampledb', {useMongoClient: true});
////admin:tcomkleo@172.30.191.158:27017
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
    username: String,
    icon: String,
    topic: [{title: String, color: String, movieIDs: []}],
    reccomendations: [],
    takenSurvey: Boolean
});

var UserData = mongoose.model('UserData', userData);
var NewMovies = mongoose.model('NewMovies',newMovies);
var Resources = mongoose.model('Resources', resources);
var UserRatings = mongoose.model('UserRatings', userRatings);

const port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
//app.use(express.static(__dirname + '/QuarenTimeLeo/dist/QuarenTime'));



app.get('/', (req,res) => { 
 // res.sendFile(path.join(__dirname));
  res.send("hello");
//console.log("hello")
});

//const server = http.createServer(app);

app.listen(port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + port )
});
//server.listen(port,() => console.log( "this compiles!"));

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


app.post('/use-addr', function(req,res) {
   // console.log(req.body);
     let user =  new UserRatings({email: req.body.email, average: req.body.average, ratings: req.body.ratings,newratings: 0});
     db.collection("Resources").findOne({Type: 'movies'}).then(elem => {
        db.collection("Resources").updateOne({Type:'movies'}, {$set:  {UsersLength: elem.UsersLength + 1}});
    })
    if(req.body.email == "quarentimetcomk@hotmail.com"){ //if trial user than we update and not insert new (except from first time)

      db.collection("UserRatings").findOne({email: req.body.email}).then(doc => {
      if(doc == null){
        db.collection("UserRatings").insertOne(user, function (err, results) {                                                                                                                           //how to insert users into mongodb
          res.json(results);
  });
      }else{
      db.collection("UserRatings").updateOne({email: req.body.email},{$set:{average: req.body.average, ratings: req.body.ratings}}, function (err, results) {                                                                                                                           //how to insert users into mongodb
        res.json(results);
});
      }
})
    }else{
    db.collection("UserRatings").insertOne(user, function (err, results) {                                                                                                                           //how to insert users into mongodb
            res.json(results);
    });
  }
})

function createMatrix(email) {
  //var _this = this;
  var position = 0;
  var ratingMatrix = [];
  for (var i = 0; i < recommendation.userLength; i++) {
      ratingMatrix[i] = new Array(recommendation.movieLength); // we added one number to 9742 because we added the average;
  }
  var results = [];
  /** var results = [];
    db.collection("UserRatings").find({}).toArray().then(function(doc){
		doc.forEach(element => { 
                results.push(element.email);})
                res.json(results);
		}); */
  return db.collection("UserRatings").find({}).toArray().then(function(doc){
		doc.forEach(element => { 
                results.push(element.email);})
                return results;
		}).then(function (emails) {
      emails.forEach(function (element) {
          if (element != email) {
            /**let query = req.query.email;

    db.collection("UserRatings").findOne({email: query}).then(function(doc){                                               //how to find elements in mongodb
        res.json(doc);
    }); */
    db.collection("UserRatings").findOne({email: element}).then(function(doc){                                               //how to find elements in mongodb
     return doc;
  }).then(function (user) {
                  ratingMatrix[position][0] = user.email;
                  ratingMatrix[position][1] = user.average;
                  //   console.log(ratingMatrix[position][0]);
                  //  console.log(ratingMatrix[position][1]);
                  var ratings = recommendation.adjustMovieArray(user.ratings); //read all ratings in the correct form
                  for (var j = 2; j < ratings.length + 2; j++) //fill in the return matrix with rating vectors one at a time
                      ratingMatrix[position][j] = ratings[j - 2]; //the ratings array is shifted by two because it does not have email and average
                  position++;
              });
          }
      });
      return ratingMatrix;
  });
  
};

initTranslationArray = function () {
 return db.collection("Resources").findOne({Type:'movies'}).then(result => { 
  return result.Dataset });
  /*return fetch('http://localhost:3000/translation').then(function (response) {
    return response.json();
  });*/
};

initUser = function (email) {
  //var _this = this;
  var result = new Array(recommendation.movieLength);
//console.log(email)
  return db.collection("UserRatings").findOne({email: email}).then(function(user){                                               //how to find elements in mongodb
    result[0] = user.email;
      result[1] = user.average;
     var rate = user.ratings[0].rate;
     var specialCase = true;//check if all ratings are equal
     for(var i = 0; i < user.ratings.length; i++){
if(user.ratings[i].rate != rate)
specialCase = false;
     }
     if(specialCase)//this happens only if not all ratings were the same
     result[1] = result[1] - 0.1;

      var ratings = recommendation.adjustMovieArray(user.ratings); //read all ratings in the correct form
      for (var j = 2; j < ratings.length + 2; j++) //fill in the return matrix with rating vectors one at a time
          result[j] = ratings[j - 2]; //the ratings array is shifted by two because it does not have email and average
      return result;
});

  /*return fetch('http://localhost:3000/user/?email=' + email).then(function (res) {
      return res.json();
  }).then(function (user) {
      result[0] = user.email;
      result[1] = user.average;
      var ratings = recommendation.adjustMovieArray(user.ratings); //read all ratings in the correct form
      for (var j = 2; j < ratings.length + 2; j++) //fill in the return matrix with rating vectors one at a time
          result[j] = ratings[j - 2]; //the ratings array is shifted by two because it does not have email and average
      return result;
  });*/
};

app.get('/compute-recommendation', function(req,response,next) { 
	let email = req.query.email;
    //recommendation.recommend(query);
    
   // var _this = this;
    var bestMovies = [];
    /**
     * db.collection("Resources").findOne({Type:'movies'}).then(result=> {
        var lengths = [result.MoviesLength, result.UsersLength];
        res.send(lengths);
    })
     */
  //  recommendation.initLengths().then(function (res) { OLD CODE
    db.collection("Resources").findOne({Type:'movies'}).then(result=> {
     // recommendation.userLength = Number(res[1]); OLD CODE
    //  recommendation.movieLength = Number(res[0]) + 2; OLD CODE

    recommendation.userLength = result.UsersLength;
    recommendation.movieLength = Number(result.MoviesLength) + 2;

       // recommendation.createMatrix(email).then(function (res) { OLD CODE
       createMatrix(email).then(function (res) {
            var ourMatrix = res;
            initUser(email).then(function (res) {
              recommendation.currentUserRatings = res;
                var weights = new Array(recommendation.userLength - 1);
                var predictedUserScores = new Array(recommendation.movieLength - 2); 
               // var tryNumb = 0;
                //for(var i = 0; i < recommendation.currentUserRatings.length; i++){
                  //if(recommendation.currentUserRatings[i] != 0)
               // }
           //     console.log("our user " + recommendation.currentUserRatings)
                for (var i = 0; i < (recommendation.userLength - 1); i++) { 
weights[i] = recommendation.pearson_similarity(ourMatrix[i],recommendation.currentUserRatings);                   
//console.log(weights[i]);
}
                var neighbors = recommendation.nearestKNeighbors(weights, 20);
                var neighborWeights = new Array(20);
                for (var i = 0; i < neighborWeights.length; i++) {
                    neighborWeights[i] = weights[neighbors[i]];
                }
                var neighboursRating = new Array(20);
                for (var i = 0; i < neighborWeights.length; i++) {
                    neighboursRating[i] = ourMatrix[neighbors[i]];
                }
                var tneighbor = recommendation.transpose(neighboursRating);
               
for (var i = 2; i < recommendation.movieLength; i++) {
                    if (recommendation.currentUserRatings[i] == 0) {
                        predictedUserScores[i - 2] = recommendation.scorePrediction(tneighbor[i], neighborWeights, tneighbor[1], recommendation.currentUserRatings[1]);                        
}
                    else {
                        predictedUserScores[i - 2] = 0;
                    }
                }
                bestMovies = recommendation.nearestKNeighbors(predictedUserScores, 50); // this is the number of recommended movies we want to display in watch me.                    
                initTranslationArray().then(function (res) {
                    var translation = res;
                    var recommendedmovies = bestMovies
                        .map(function (x) { return translation[x]; });
                  //  console.log(recommendedmovies);
                    //_this.storeRecommendation(email, recommendedmovies);
                   
                    db.collection("UserData").updateOne({email: email}, {$set:  {reccomendations: recommendedmovies,takenSurvey: req.query.realUser}}, function (err, result) {
                      if (err){
                          response.sendStatus(400);//send error message BAD REQUEST
                      }   
                      else {
                          
                          response.send("okay");//send OK message
                      }
                      });
                   
                });
            });
        });
    }).catch(err => res.status(404)        // HTTP status 404: NotFound
    .send("An error has occurred"))


  //  res.send("okay");
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
                        //console.log("sending response")
                        res.json("0");
                       //res.json(JSON.stringify("0"));
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
                                     //   console.log(result.ratings); 
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
    let user =  new UserData({email: req.query.email, username: req.query.username, icon: '0x1F606', topic: [{title: 'Watch List', color: '#FFC857', movieIDs: []}, {title: 'Favourite', color: '#E9724C', movieIDs: []},
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

    app.get('/update-username', function(req, res) {//MORE NEW CODE TO UPDATE AN ICON
      db.collection("UserData").updateOne({email: req.query.email}, {$set:  {username: req.query.username}}, function (err, result) {//UPDATE ICON
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
 //    console.log(req.query.email)
   //  console.log(req.query.index)
    // console.log(req.query.movieID)
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

var fs = require('fs');//code to add dataset

app.get('/init-resources', function(req, res){
  
  mongoose.connection.db.listCollections().toArray(function(err, names){
    if(err){
      console.log(err)
    }else{
      var insertData = true;
      for(var i = 0; i < names.length; i++){
       // console.log(names[i].name)
        if(names[i].name == "Resources"){
      insertData = false; 
        }
      }
      if(insertData){
        var all = fs.readFileSync('array.txt', 'utf8');
        all = all.trim();  // final crlf in file
        let numbers = all.split(",").map(Number);
        
         let user =  new Resources({MoviesLength:9742, UsersLength:610, Type:'movies', 
           Dataset:numbers});
            db.collection("Resources").insert(user, function (err, results) {                                 //how to insert users into mongodb
                console.log("new data inserted");
            });
      }
    }
    res.send("resources is now in the database")
  })


	});


  app.get('/init-user-ratings', function(req, res){
  
    mongoose.connection.db.listCollections().toArray(function(err, names){
      if(err){
        console.log(err)
      }else{
        var insertData = true;
        for(var i = 0; i < names.length; i++){
         // console.log(names[i].name)
          if(names[i].name == "UserRatings"){
        insertData = false; 
          }
        }
        if(insertData){
          let all = fs.readFileSync('FinalMovieDataset.txt', "utf8");     
          all = all.trim();  // final crlf in file
   let lines = all.split("\r\n");
   let n = lines.length;
   var matrix = [];
   for(var i=0; i < 610; i++) {
       matrix[i] = new Array(9744);                        //we added one number to 9742 because we added the average;
   }
   
   for (let i = 0; i < n; i++) {  // each line
     let tokens = lines[i].split(" ");
     
     for (let j = 0; j < 9744;j++) {  // each val curr line
       matrix[i][j] = Number(tokens[j]);
     }
   }
   
   let rowObj = {movieId: 0, rate: 0};
   
   for(let i = 0; i < 610; i++) {
       let array = [];
       for(let j = 2; j < 9744; j ++) {
           if( matrix[i][j] == 0) { 
               continue;
           }
           else { 
               rowObj = {movieId: j-2, rate: matrix[i][j]};
               array.push(rowObj);
              
           }   
       }
     
     let user =  new UserRatings({email: matrix[i][0], average: matrix[i][1], ratings:array});
       db.collection("UserRatings").insert(user, function (err, results) {                                 //how to insert users into mongodb
           console.log(results)
       }); 
    
   }
        }
      }
      res.send("user ratings are now in the database")
    })
  
  
    });

  /*var all = fs.readFileSync('array.txt', 'utf8');
all = all.trim();  // final crlf in file
let numbers = all.split(",").map(Number);

 let user =  new Resources({MoviesLength:9742, UsersLength:610, Type:'movies', 
	 Dataset:numbers});
    db.collection("Resources").insert(user, function (err, results) {                                 //how to insert users into mongodb
        console.log("new data inserted");
    });*/

    
   /* 
   //  var fs = require('fs');
let all = fs.readFileSync('FinalMovieDataset.txt', "utf8");     
       all = all.trim();  // final crlf in file
let lines = all.split("\r\n");
let n = lines.length;
var matrix = [];
for(var i=0; i < 610; i++) {
    matrix[i] = new Array(9744);                        //we added one number to 9742 because we added the average;
}

for (let i = 0; i < n; i++) {  // each line
  let tokens = lines[i].split(" ");
  
  for (let j = 0; j < 9744;j++) {  // each val curr line
    matrix[i][j] = Number(tokens[j]);
  }
}

let rowObj = {movieId: 0, rate: 0};

for(let i = 0; i < 610; i++) {
    let array = [];
    for(let j = 2; j < 9744; j ++) {
        if( matrix[i][j] == 0) { 
            continue;
        }
        else { 
            rowObj = {movieId: j-2, rate: matrix[i][j]};
            array.push(rowObj);
           
        }   
    }
  
  let user =  new UserRatings({email: matrix[i][0], average: matrix[i][1], ratings:array});
    db.collection("UserRatings").insert(user, function (err, results) {                                 //how to insert users into mongodb
        console.log(results)
    }); 
 
}*/