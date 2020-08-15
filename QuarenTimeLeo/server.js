const express = require('express'); 
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
let fs = require('fs');
let all = fs.readFileSync('C://Users//anasa//Documents//Network and Communication//task1//FinalMovieDataset.txt', "utf8");
let router = express.Router();

mongoose.connect('mongodb://localhost:27017/test');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("success");
});

let ObjectID = require('mongodb').ObjectID;

app.use(cors());
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
var userData = new Schema({ //START OF NEW CODE
    email: String,
    icon: String,
    topic: [{title: String, color: String, movieIDs: []}],
    reccomendations: [],
    takenSurvey: Boolean
}); //END OF NEW CODE
    
var UserData = mongoose.model('UserData', userData);
var NewMovies = mongoose.model('NewMovies',newMovies);
var Recources = mongoose.model('Recources', resources);
var UserRatings = mongoose.model('UserRatings', userRatings);



const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/dist/QuarenTime'));

router.get('/testing', (req,res) => { 
    console.log("connected");
});

app.get('/*', (req,res) => res.sendFile(path.join(__dirname)));

const server = http.createServer(app);

server.listen(port,() => console.log( "this compiles!"));





app.get('/get-users', function(req, res, next){
    var results = [];
    db.collection("UserRatings").find().forEach(element => { 
                results.push(element.email);}).then(() => { 
                console.log(results);
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
     db.collection("Recources").findOne({Type: 'movies'}).then(elem => {
        db.collection("Recources").updateOne({Type:'movies'}, {$set:  {UsersLength: elem.UsersLength + 1}});
    })
    db.collection("UserRatings").insertOne(user, function (err, results) {                                                                                                                           //how to insert users into mongodb
            res.json(results);
    });
})



app.get('/translation', function(req,res,next) { 
    db.collection("Recources").findOne({Type: 'movies'}).then(result => { 
            res.send(result.Dataset); });
})


app.get('/get-length', function(req,res){ 
    db.collection("Recources").findOne({Type:'movies'}).then(result=> {
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

    

    db.collection("Recources").findOne({Type: 'movies'}).then(doc=>{
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
                            db.collection("Recources").findOne({Type: 'movies'}).then(elem => { 
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
                            
                                db.collection("Recources").updateOne({Type:'movies'}, {$set:  {MoviesLength: elem.MoviesLength + 1}});
                                db.collection("Recources").updateOne({Type:'movies'},{$push: {Dataset: Number(usermovie)}});
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



/*db.collection("UserRatings").remove({email:'999'});
db.collection("UserRatings").remove({email:'888'});
db.collection("UserRatings").remove({email:'777'});
db.collection("UserRatings").remove({email:'1111'});
db.collection("UserRatings").remove({email:'3333'});
db.collection("UserRatings").remove({email:'4444'});*/
let testUser = new UserRatings({email: '999', average: 3, ratings: [{movieId: 30, rate: 3}], newratings: 0});
//let newmovie2  =  new NewMovies({movieId: 32, counter: 1, ratings:[{email:44,rate:5}]});                                                                                                   //TESTING PURPOSES
//db.collection("NewMovies").insertOne(newmovie2, function(err,results) {});
    
//db.collection("UserRatings").insert(testUser,function(err,res){});
//db.collection("UserRatings").update({email:'999',"ratings.movieId": 23},{$inc:{"ratings.$.rate": 1}});


//db.collection("Recources").update({Type:'movies'}, {$set: {MoviesLength:9742}});
//db.collection("Recources").update({Type:'movies'}, {$set: {UsersLength:610}});
//db.collection("Recources").update({Type:'movies'},{$push: {Dataset: 99999999}});


/*db.collection("Recources").find().then(doc => { 
    doc.forEach(elem => {
        console.log(elem);
    })
})*/

/*db.collection("UserRatings").find({email: '999'}).then(elem => { 
    elem.forEach(stuff => {
        stuff.ratings.find({movieId: 23}).then((res)=> {
            console.log(res);
        }) 
        
    })
}) */
 





/*
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


/*UserRatings.findOne({'email': '17'}, function(err,res) { 
    if(err) 
        return handleError(err);
    console.log(res.ratings.rate);
});*/ 


                                                        //TESTING PURPOSES

/*db.collection("UserRatings").insert(user, function (err, results) {
    console.log(results)
}); */




//db.collection("UserRatings").update({email: '999'},{$push: {ratings: movierating}});                           //how to update the movies array in mongodb

/*

db.collection("UserRatings").find({email: '999'}).then(function(doc){                                               //how to find elements in mongodb
    doc.forEach(element => {
        element.ratings.forEach(movies => {
            if(movies.movieId == 44)
                console.log(movies.rate);
        });
    }); 
});











/*
//UserRatings.update({email: 'user1@hotmail.com'} , {average: 7});


//var user1 = new UserRatings({ email: 'user3@hotmail.com', average:4, ratings:{movieId: 6, rate: 5} });


//user1.save();
//for(var i = 0; i < 1000000; i++) 
  //  var j = i + i;

UserRatings.find({ email: 'user1@hotmail.com'}).then(function(doc) { 
   
   console.log(doc);
   
}).catch(function(err) { 
    console.log(err.message);
}); 
     
*/