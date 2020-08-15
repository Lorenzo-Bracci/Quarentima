import { Component} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'firebase';
import { MatDialog } from '@angular/material/dialog';
import { MoviePageComponent } from '../../movie-page/movie-page.component';
import { MovieAPI } from '../../../Class/MovieAPI/movie-api';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-nav-buttons',
  
  templateUrl: './nav-buttons.component.html',
  styleUrls: ['./nav-buttons.component.scss']
})
export class NavButtonsComponent {

  user: User;

  constructor(
    public auth: AngularFireAuth,
    private db: AngularFirestore,
    private dialog: MatDialog) {
    auth.currentUser.then(value => {
      this.user = value;
    });
  }

  getRandomMovie() {
    /*this.db.collection('users')
      .doc(this.user.uid)
      .get().subscribe(next => {
        const movieIDs = next.data().recommendations;*/
        fetch('http://localhost:3000/load-list?email=' + this.user.email)
            .then(function (response) {
            return response.json();
        }).then(userData => {
            
            const movieIDs = userData.reccomendations;

        const randomIndex = Math.floor(Math.random() * movieIDs.length);

        MovieAPI.getMovie(movieIDs[randomIndex]).then(movie => {
          this.dialog.open(MoviePageComponent, {
            data: movie
          });
        });
      });
  }
}
