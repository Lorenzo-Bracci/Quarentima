import { Component, OnInit } from '@angular/core';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import '@firebase/firestore';
import '@firebase/storage';
import { FirebaseApp } from '@angular/fire';
import * as firebase from 'firebase/app';
import { environment } from '../../../../environments/environment';
import { AngularFireStorage } from '@angular/fire/storage';
import  DatasetFunction from '../../../../assets/detaset';

@Component({
  selector: 'app-compute-recommendation',
  templateUrl: './compute-recommendation.component.html',
  styleUrls: ['./compute-recommendation.component.scss']
})


export class ComputeRecommendationComponent implements OnInit {

  currentUserRatings = [];
  userLength:number = 610;
  movieLength: number = 9744;



  
  

  constructor(private database:AngularFireStorage) {  
    this.recommend();
  }

  ngOnInit(): void {
  }


  initCurrentUser() { 
    this.currentUserRatings[0] = "test";
    this.currentUserRatings[1] = 4.5;
    for(var i = 2; i< 12; i++) { 
      this.currentUserRatings[i] = 4;
    }

    for(var i = 12; i< 22; i++) { 
      this.currentUserRatings[i] = 5;
    }

    for(var i = 22; i < this.movieLength; i++) {
      this.currentUserRatings[i] = 0;
    }

  }




  createMatrix(){ 
   
    var dataset = DatasetFunction;
   
    let lines = dataset.split("\n");
    
   
    let n = lines.length;
    
    var ratingMatrix = [];
    for(var i=0; i < this.userLength; i++) {
      ratingMatrix[i] = new Array(this.movieLength);                        //we added one number to 9742 because we added the average;
  }

  for (let i = 0; i < n - 1; i++) {  // each line
    let tokens = lines[i].split(" ");
  
  
  for (let j = 0; j < 9744;j++) {  // each val curr line
    ratingMatrix[i][j] = Number(tokens[j]);
  }
}



return ratingMatrix;
  }

  simple_avg(vector: number[]): number{
    var acc = 0;
    var notzero = 0;
    for(var i = 0; i< vector.length; i++){
      if(vector[i] != 0){
        notzero++;
      }
      acc += vector[i];
    }
    
    return (acc/notzero);
  }


  weighted_Avg(vector:number[], weights:number[]): number{
   
    if(vector.length!=weights.length) {
      alert("error in weighted average")
      return 0;
    }
    
    var num = 0;
    var deno = 0;

    for(var i =0; i <vector.length;i++) {
      if(vector[i] != 0) {                    //this to deal with the missing rates. and not add the weights.
        num += vector[i]*weights[i];                
        deno += weights[i];
      }
    }

    return (num/deno);
  }

  dot(val1:number[],val2:number[]):number {
    if(val1.length!=val2.length){
      alert("error in dot");
      return 0;
    }

    var result = 0;
    for(var i = 0; i < val1.length; i++){
      result += (val1[i]*val2[i]);
    }
    return result;
  }

  vector_length(vector1:number[]):number{
    
    var res = 0;
    for(var i = 0; i < vector1.length; i++){
      res += (vector1[i]*vector1[i]);
    }
    return Math.sqrt(res);

  }

  pearson_similarity(vector1:number[], vector2:number[]): number{
    
    if(vector1.length!=vector2.length) {
      alert("error in pearson")
      return 0;
    }


    var vector1_Avg = vector1[1];                            //we get the avgs from the arrays, we already stored the avgs in the arrays.
    var vector2_Avg = vector2[1];
   
  

    var pearson_vector1: number[] = new Array(this.movieLength - 2);
    var pearson_vector2: number[] = new Array(this.movieLength - 2);
    
    for(var i = 2; i < this.movieLength;i++){
      if(vector1[i] != 0 ){
        pearson_vector1[i - 2] = vector1[i] - vector1_Avg;         //Changing the vectors to vector-average 
      } else { 
        pearson_vector1[i - 2] = 0;
      }
      if(vector2[i] != 0 ){
        pearson_vector2[i - 2] = vector2[i] - vector2_Avg;
      } else { 
        pearson_vector2[i - 2] = 0;
      }
    }
    
   
    var dot:number = this.dot(pearson_vector1,pearson_vector2);
    var num:number = this.vector_length(pearson_vector1)*this.vector_length(pearson_vector2);

  
    
    return (dot/num);

  }

  scorePrediction(vector:number[], weights:number[],usersAvg:number[],currentUserAvg:number): number{                        //another weighted average method (better?)
  
    
    var num = 0;
    var deno = 0;
    
    for(var i = 0; i < vector.length;i++) {
      if(vector[i] != 0) {                    //this to deal with the missing rates. and not add the weights.
        num += (vector[i]-usersAvg[i])*weights[i];                
      } else { 
        num += 0;                        //its only to consider a unrated as an average rated movie.
      }
      deno += weights[i]; 
    }
    if(deno == 0) { 
      return currentUserAvg;
    }

   
    return ((num/deno) + currentUserAvg);
  }
  




   sort(weights:number[],userID:number[]){
    var arr:number[] = new Array(this.userLength);

    for(var i = 0; i < this.userLength; i++) { 
      arr[i] = weights[i];
    }


     for(let i:number = 0; i < arr.length; i++){
  
      let j = i-1;
      let key = arr[i];
      let keyID = userID[i];
  
      while(j>-1 && arr[j]<key){
        arr[j+1] = arr[j];
        userID[j+1] = userID[j];
        j--; 
      }
  
      arr[j+1] = key;
      userID[j+1] = keyID;
      
     }

     
    
        

  }

  nearestKNeighbors(array:number[], k) :number[]{ 
    var neighborsID: number[] = new Array(k);
    var index: number[] = new Array(array.length);
  
    
    for(var i = 0; i < array.length; i++) {
      index[i] = i;
    }
    

    this.sort(array,index);
    
    for(var i = 0; i < k; i ++ ){ 
      neighborsID[i] = index[i];
    }

    return neighborsID; 
  }



  recommend():void{
    this.initCurrentUser();
  
    var ourMatrix = this.createMatrix();
    
    var weights:number[] = new Array(this.userLength);
    var predictedUserScores = new Array(this.movieLength - 2);

    for(var i = 0; i < this.userLength; i++) {
      weights[i] = this.pearson_similarity(ourMatrix[i],this.currentUserRatings);
    }  

    var neighbors= this.nearestKNeighbors(weights,4);
   

    var neighborWeights:number[] = new Array(4);
    for(var i = 0; i< neighborWeights.length; i++) {
      neighborWeights[i] = weights[neighbors[i]];
    }
    
    var neighboursRating = new Array(4);
    for(var i = 0; i< neighborWeights.length; i++) {
      neighboursRating[i] = ourMatrix[neighbors[i]];
      
    }
    

    var tneighbor = this.transpose(neighboursRating);
    
    for(var i = 2; i < this.movieLength; i++) {
      predictedUserScores[i-2] = this.scorePrediction(tneighbor[i], neighborWeights, tneighbor[1],this.currentUserRatings[1]);
     
    }
    

    var bestMovies = this.nearestKNeighbors(predictedUserScores,50);
    
    
  

  }
    transpose(array){
      var transArray = new Array(this.movieLength);
      for(var i = 0; i< this.movieLength; i++) {
        transArray[i] = new Array(array.length);                                    // 20 is just a size k we cna change later
      }

        for (var i = 0; i < this.movieLength; i++) { 
        for (var j = 0; j < array.length; j++) { 
           transArray[i][j] = array[j][i];
  }
}

return transArray;
    }



/* var storageRef = this.database.ref('FinalMovieDataset.txt');
  // Get the download URL 
  storageRef.getDownloadURL().subscribe(function(url) {
  console.log(url);

  //fetch(url).then(response =>  { 
   // console.log(response);
  //})
  
  /*var xhr = new XMLHttpRequest();
  xhr.responseType = "";
  xhr.onload = function(event) {
    var movieDataset = xhr.response;
    console.log("success");
  };
  
  xhr.open('GET', url);
  xhr.send();
*/
 /* recommended():void{
    var vector1:number[] = [4, 0, 0, 5, 1, 0];         //3.3
    var vector2:number[] = [5, 5, 4, 0, 0, 0];         //14/3
    var vector3:number[] = [0, 0, 0, 2, 4, 5];          
    
    var weight1 = this.pearson_similarity(vector1,vector2);
    var weight2 = this.pearson_similarity(vector1,vector3);
    
    for(var i = 0; i < vector1.length; i++) {
      var arr = [vector2[i], vector3[i]];
      var arrWeights = [weight1,weight2];
      var userAvg = this.simple_avg(vector1);
      var usersAvg:number[] = [this.simple_avg(vector2),this.simple_avg(vector3)]
      
      var score = this.scorePrediction(arr,arrWeights, usersAvg ,userAvg);                    //Dont count movies with really few k neighbors
      console.log("the predicted score for movie number:" + i + "is" + score);
    }
    
    
    //we store the 10 recommended movies 
  }*/
}
