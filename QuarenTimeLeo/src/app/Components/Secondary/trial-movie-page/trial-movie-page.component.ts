

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Domain } from '../../Class/domain';

@Component({
  selector: 'app-trial-movie-page',
  templateUrl: './trial-movie-page.component.html',
  styleUrls: ['./trial-movie-page.component.scss']
})
export class TrialMoviePageComponent {

  @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
userEmail: string;
  trailer: string;
 // userId: string;
  movies: number[];

  //topics = [];
  colors = [
    '#FFC857',
    '#E9724C',
    '#C5283D',
    '#255f85',
    '#9ed964'
  ];

  constructor(
    public dialogRef: MatDialogRef<TrialMoviePageComponent>,
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    @Inject(MAT_DIALOG_DATA) public data: Movie) {
    MovieAPI.getTrailer(data.id).then(result => {
      this.trailer = result;
    });
    auth.currentUser.then(value => {
    //  this.userId = value.uid;
      this.userEmail = value.email;
     // this.moveTheLists();
    });
  }

  adding = false;
  done = false;

 

  openTrailerOnNewTab() {
    if (this.trailer) {
      window.open(this.trailer, '_blank');

    }
  }


}

