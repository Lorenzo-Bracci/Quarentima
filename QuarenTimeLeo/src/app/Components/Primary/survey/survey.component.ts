import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Recommendation } from '../../Class/recommendation/recommendation';
import { Hashfunction } from '../../Class/hashfunction/hashfunction';
import { Domain } from '../../Class/domain';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  user = {
    fireUser: null,
    name: '',
    email: '',
    avatar: '',
  };

  @Input() input = '';
  @Output() searchInputChange: EventEmitter<string> = new EventEmitter<string>();

  index = 0;                          // to keep position of movies a user skip without rating.
  numberOfRatedMovies = 0;
  userRatings: any[] = [];                    // The array that has the ratings of each user.

  SearchResults: Movie[] = [];
  recomendedMovies: number[];                 // the result recommendations.
  SumOfRatings = 0;                   // The sum of the total ratings of movies.

  selectedMovie: Movie;

  InSurveyComponent: boolean = true;
  
  translationArray: number[] = [];






  passedMovies: number[] = [];

   test = new Date();
   prev = ( this.test.getMilliseconds() ) % 9949;                                     
   userEmail:string = "";
   userArray = [];
   average = 0;


  constructor(
    private router: Router,
    private db: AngularFirestore,
    private auth: AngularFireAuth) {
    auth.currentUser.then(value => {
      if(value){
      this.user.fireUser = value;
      //this.user.name = value.displayName;
      this.user.email = value.email;
      this.userId = value.uid;
      }else{
        this.router.navigate([``]);
      }
    });
  }
  userId: string;
  @ViewChild('panel', { read: ElementRef }) public panel: ElementRef;

  ngOnInit(): void {
    console.log("init works!");
   
    
    this.initTranslationArray().then(res => {
      this.translationArray = res; 
      
      for (var i = 0; i < this.translationArray.length; i++)
        Hashfunction.put(this.translationArray[i], i);
    
      this.userEmail = this.user.email;
      this.userRatings = Array(9744).fill(0);              //we dont need to fill 0s here.
      this.userRatings[0] = this.user.email;               //we dont need this either.

      MovieAPI.getMovie(this.translationArray[Math.floor(Math.random() * (this.translationArray.length - 1))])
        .then(movie => {
          this.selectedMovie = movie;
        //console.log(movie.id)
        });
      });
  }
  setRating(rating: number) {
    this.userArray.push({movieId: Hashfunction.get(this.selectedMovie.id), rate: rating});                  //movieId is wrong here.
    
    this.userRatings[Hashfunction.get(this.selectedMovie.id) + 2] = rating;
    this.numberOfRatedMovies += 1;
    this.SumOfRatings += rating;

    this.nextMovie();
  }

  nextMovie() {
    let randomMovieID = this.translationArray[Math.floor(Math.random() * (this.translationArray.length - 1))];
    while (this.passedMovies.includes(randomMovieID)) {
      randomMovieID = this.translationArray[Math.floor(Math.random() * (this.translationArray.length - 1))];
    }
    this.passedMovies.push(this.selectedMovie.id);
    MovieAPI.getMovie(randomMovieID)
      .then(movie => {
        this.selectedMovie = movie;
      });
  }



  onSubmitSurvey() {
    if (this.numberOfRatedMovies >= 10) {
      //else{
      this.average = (this.SumOfRatings / this.numberOfRatedMovies);
      var user = {email: this.userEmail, average: this.average, ratings: this.userArray};
      
      
      fetch(Domain.url + 'user-add', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user),        
      })  
      .then(response => {
        return response.json();}).then((res) => {
 //const result = Recommendation.recommend(this.userEmail);
 if(this.userEmail == "quarentimetcomk@hotmail.com"){ //trial user
  fetch(Domain.url + 'compute-recommendation?email=' + this.userEmail + "&realUser=false").then((e) => {
    console.log("Recomendations recieved");
    this.router.navigate([`/trialpage`]);
  });    
 }else{
 fetch(Domain.url + 'compute-recommendation?email=' + this.userEmail + "&realUser=true").then((e) => {
  console.log("Recomendations recieved");
  this.router.navigate([`/mainpage`]);
});   
         //console.log(res);
}
        })
         .catch((err) => {
        console.log(err);
      });

    //}
    }
  }

  storeRecommendation(email: string, recommendations: number[]) {
    fetch(Domain.url + 'store-recommendation', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, ratings: recommendations})
    }).then((e) => {
      console.log(e);
    });
  }

  emitInputChange(input) {
    this.input = input;

    if (input) {
      MovieAPI.search(input).then(result => {
        this.SearchResults = result.filter(movie => Hashfunction.get(movie.id) !== -1);
      });
    } else {
      this.SearchResults = [];
    }

  }
  receiveMovie($event: Movie) {
    this.selectedMovie = $event;
  }
  
    initTranslationArray(){

   
     return fetch(Domain.url + 'translation').then((response) => {
     console.log("hello");
      return response.json();});
    }

}
