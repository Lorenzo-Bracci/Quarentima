import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Domain } from '../../Class/domain';

@Component({
  selector: 'app-movie-page',
  templateUrl: './movie-page.component.html',
  styleUrls: ['./movie-page.component.scss']
})
export class MoviePageComponent {

  @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
userEmail: string;
  trailer: string;
  userId: string;
  movies: number[];

  topics = [];
  colors = [
    '#FFC857',
    '#E9724C',
    '#C5283D',
    '#255f85',
    '#9ed964'
  ];

  constructor(
    public dialogRef: MatDialogRef<MoviePageComponent>,
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    @Inject(MAT_DIALOG_DATA) public data: Movie) {
    MovieAPI.getTrailer(data.id).then(result => {
      this.trailer = result;
    });
    auth.currentUser.then(value => {
      this.userId = value.uid;
      this.userEmail = value.email;
      this.moveTheLists();
    });
  }

  adding = false;
  done = false;

  moveTheLists(){
    
  fetch(Domain.url + 'load-list?email=' + this.userEmail)
            .then(function (response) {
            return response.json();
        }).then(userData => {
        const lists = userData.topic;
          this.topics = [];
          lists.forEach(list => {
            const color = list.color;
            const title = list.title;
            const movieIDs = list.movieIDs;
           // console.log(title)
            this.topics.push({ color, title, movieIDs });
          }
          );
          });
        
        
    /*this.db.collection('users')
        .doc(this.userId)
        .get().subscribe(next => {
          const lists = next.data().lists;
          this.topics = [];
          lists.forEach(list => {
            const color = list.color;
            const title = list.title;
            const movieIDs = list.movieIDs;
            this.topics.push({ color, title, movieIDs });
          });
        });*/
  }

  openTrailerOnNewTab() {
    if (this.trailer) {
      window.open(this.trailer, '_blank');

    }
  }

  addMovieToList(topicIndex: number) {
    this.done = !this.done;
    if (!this.topics[topicIndex].movieIDs) {
      this.topics[topicIndex].movieIDs = [];
    }
    if (!this.topics[topicIndex].movieIDs.includes(this.data.id)){
      this.topics[topicIndex].movieIDs.push(this.data.id);
      fetch(Domain.url + 'add-movie-to-topic?email=' + this.userEmail + '&index=' + topicIndex + '&movieID=' + this.data.id).then(response => {
      }).catch(err => console.log(err));
      
      //this.db.collection('users').doc(this.userId).update({
      //lists: this.topics
      //});
    }
    this.adding = false;
    this.done = true;
  }

  setRating(rating: number) {
    fetch(Domain.url + 'rate-movie', {
      method: 'POST',
      headers: {
         // 'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: this.userEmail, rating: rating, movie: this.data.id})
  }).then((response) => {
     return response.json();
  }).then((data) => {
    console.log(Number(data));
    if(Number(data) > 9){
      fetch(Domain.url + 'compute-recommendation?email=' + this.userEmail).then((e) => {
        console.log("Recomendations recieved");
      }).catch((err) => {
        console.log(err);
      }); 
    }
});
  }
}
