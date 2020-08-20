
import { Component } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { Domain } from '../../Class/domain';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trialpage',
  templateUrl: './trialpage.component.html',
  styleUrls: ['./trialpage.component.scss']
})
export class TrialpageComponent {

  movies: Movie[] = [];
  user: User;
  input = '';

  selectedGenre = '';
  recommendations: Movie[] = [];

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private auth: AngularFireAuth) {
    auth.currentUser.then(value => {
     console.log(value)
      if (value) {
        this.user = value;
//while(this.movies.length == 0){
fetch(Domain.url + 'load-list?email=' + this.user.email)
            .then(function (response) {
            return response.json();
        }).then(userData => {
            
            MovieAPI.getMovieByIds(userData.reccomendations).then(newMovies => {
            this.recommendations = newMovies;
            this.movies = this.recommendations;
          console.log(this.movies)
          });
            
});

      }else{
        this.router.navigate([``]);
        }
    });
  }

  updateInput(input) {
    this.input = input;
  }

}

