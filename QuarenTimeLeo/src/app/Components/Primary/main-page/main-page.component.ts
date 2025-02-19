import { Component } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { Domain } from '../../Class/domain';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {

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
//}
        /*this.db.collection('users').doc(this.user.uid).get().subscribe(item => {
          const lists = item.data().lists;
          const ids = [];
          lists.forEach(list => {
            list.movieIDs.forEach(id => {
              ids.push(id);
            });
          });
          MovieAPI.getMovieByIds(item.data().recommendations).then(movies => {
            this.recommendations = movies;
            for (const movie of movies){
              this.recommendations = this.recommendations.filter(x => !ids.includes(x.id));
            }
            this.movies = this.recommendations;
          });
        });*/
      }else{
        this.router.navigate([``]);
        }
    });
  }

  genreButton(){
    if (this.selectedGenre === ''){
      this.selectedGenre = 'Genres';
    } else {
      this.selectedGenre = '';
      this.movies = this.recommendations;
    }
  }

  loadGenres(){
    return MovieAPI.genres.map(genre => genre.name).filter(genre => genre !== 'TV Movie');
  }
  getMovies(genres){
    MovieAPI.getMoviesOfGenre(genres).then(movies => {
      this.movies = movies;
    });
    this.selectedGenre = genres;
  }

  updateInput(input) {
    this.input = input;
  }

}
