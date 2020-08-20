import { Component, OnInit } from '@angular/core';

import 'simplebar'; // or "import SimpleBar from 'simplebar';" if you want to use it manually.
import 'simplebar/dist/simplebar.css';
import { Movie } from '../../Class/Movie/movie';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'firebase';
import { Domain } from '../../Class/domain';

@Component({
  selector: 'app-watch-it',
  templateUrl: './watch-it.component.html',
  styleUrls: ['./watch-it.component.scss']
})
export class WatchItComponent implements OnInit {

  movies: Movie[] = [];
  user: User;
  movieIDs: number[];

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth) {
    auth.currentUser.then(value => {
      this.user = value;
    });
  }

  ngOnInit(): void {
  var ids = [];
        fetch(Domain.url + 'load-list?email=' + this.user.email)
            .then(function (response) {
            console.log("Hello");
            return response.json();
        }).then(function (userData) {
            ids = userData.reccomendations;
    /*//this.db.collection('users').doc(this.user.uid).get().subscribe(item => {
      //const lists = item.data().lists;
      //const ids = [];
      //lists.forEach(list => {
        //list.movieIDs.forEach(id => {
          //ids.push(id);
        //});
      //});
      //MovieAPI.getMovieByIds(item.data().recommendations).then(movies => {*/
      MovieAPI.getMovieByIds(ids).then(movies => {
        this.movies = movies;
        /*for (const movie of movies){
          this.movies = this.movies.filter(x => !ids.includes(x.id));
        }*/
      });

    });
  }

}
