import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Input() immutable = false;

  editing = false;
  resetPassword = false; 

  user = {
    fireUser: null,
    name: 'User Userson',
    email: '',
    avatar: '\ud83d\udcbb',
  };

  topics = [];
  colors = [
    '#FFC857',
    '#E9724C',
    '#C5283D',
    '#255f85',
    '#9ed964'
  ];

  emojiIDs = [
    0x1F600,
    0x1F601,
    0x1F602,
    0x1F603,
    0x1F604,
    0x1F605,
    0x1F606,
    0x1F607,
    0x1F608,
    0x1F609,
    0x1F60A,
    0x1F60B,
    0x1F60C,
    0x1F60D,
    0x1F60E,
    0x1F60F,
    0x1F610,
    0x1F611,
    0x1F612,
    0x1F613,
    0x1F614,
    0x1F615,
    0x1F616,
    0x1F617,
    0x1F618,
    0x1F619,
    0x1F61A,
    0x1F61B,
    0x1F61C,
    0x1F61D,
    0x1F61E,
    0x1F61F,
    0x1F620,
    0x1F621,
    0x1F622,
    0x1F623,
    0x1F624,
    0x1F625,
    0x1F626,
    0x1F627,
    0x1F628,
    0x1F629,
    0x1F62A,
    0x1F62B,
    0x1F62C,
    0x1F62D,
    0x1F62E,
    0x1F62F,
  ];

  emojis = [
    String.fromCodePoint(0x1F600),
    String.fromCodePoint(0x1F601),
    String.fromCodePoint(0x1F602),
    String.fromCodePoint(0x1F603),
    String.fromCodePoint(0x1F604),
    String.fromCodePoint(0x1F605),
    String.fromCodePoint(0x1F606),
    String.fromCodePoint(0x1F607),
    String.fromCodePoint(0x1F608),
    String.fromCodePoint(0x1F609),
    String.fromCodePoint(0x1F60A),
    String.fromCodePoint(0x1F60B),
    String.fromCodePoint(0x1F60C),
    String.fromCodePoint(0x1F60D),
    String.fromCodePoint(0x1F60E),
    String.fromCodePoint(0x1F60F),
    String.fromCodePoint(0x1F610),
    String.fromCodePoint(0x1F611),
    String.fromCodePoint(0x1F612),
    String.fromCodePoint(0x1F613),
    String.fromCodePoint(0x1F614),
    String.fromCodePoint(0x1F615),
    String.fromCodePoint(0x1F616),
    String.fromCodePoint(0x1F617),
    String.fromCodePoint(0x1F618),
    String.fromCodePoint(0x1F619),
    String.fromCodePoint(0x1F61A),
    String.fromCodePoint(0x1F61B),
    String.fromCodePoint(0x1F61C),
    String.fromCodePoint(0x1F61D),
    String.fromCodePoint(0x1F61E),
    String.fromCodePoint(0x1F61F),
    String.fromCodePoint(0x1F620),
    String.fromCodePoint(0x1F621),
    String.fromCodePoint(0x1F622),
    String.fromCodePoint(0x1F623),
    String.fromCodePoint(0x1F624),
    String.fromCodePoint(0x1F625),
    String.fromCodePoint(0x1F626),
    String.fromCodePoint(0x1F627),
    String.fromCodePoint(0x1F628),
    String.fromCodePoint(0x1F629),
    String.fromCodePoint(0x1F62A),
    String.fromCodePoint(0x1F62B),
    String.fromCodePoint(0x1F62C),
    String.fromCodePoint(0x1F62D),
    String.fromCodePoint(0x1F62E),
    String.fromCodePoint(0x1F62F),
  ];
  User = new FormGroup({
    username: new FormControl(),
  });

  selectedEmoji: number;

  movies: Movie[] = [];
  selectedTopic = -1;

  sendEmail = false;
  disabledSendButton = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore) {
    auth.currentUser.then(value => {
      if (value) {
        this.user.fireUser = value;
        this.user.email = value.email;
        this.loadLists();
      }
    });
  }

  addTopic() {
    this.topics.push({ color: this.colors[4], title: 'My List', movieIDs: []});
    this.db.collection('users').doc(this.user.fireUser.uid).update({
      lists: this.topics
    });
  }

  removeTopic(index) {
    this.topics.splice(index, 1);
    this.selectedTopic = -1;
    this.db.collection('users').doc(this.user.fireUser.uid).update({
      lists: this.topics
    });
  }
  updateTopic(event, index) {
    this.topics[index].title = event.title;
    this.topics[index].color = event.color;
    this.db.collection('users').doc(this.user.fireUser.uid).update({
      lists: this.topics
    });
  }

  deleteMovieFromList(index) {
    this.movies.splice(index, 1);
    this.topics[this.selectedTopic].movieIDs.splice(index, 1);

    this.db.collection('users')
      .doc(this.user.fireUser.uid)
      .update({
        lists: this.topics
      });
  }


  clickedTopic(index) {
    this.selectedTopic = index;
    if (this.topics[index].movieIDs.length === 0) {
      this.movies = [];
    }
    const temp: Movie[] = [];
    this.topics[index].movieIDs.forEach(movieID => {
      console.log(movieID); 
      
      MovieAPI.getMovie(movieID).then(result => {
        temp.push(result);
        if (this.topics[index].movieIDs.length - 1 === this.topics[index].movieIDs.indexOf(movieID)) {
          this.movies = temp; 
        }
      });
    });
  }

  loadLists() {
    this.db.collection('users')
      .doc(this.user.fireUser.uid)
      .get().subscribe(next => {
        this.user.avatar = String.fromCodePoint(next.data().icon);
        this.user.name = next.data().username;
        const lists = next.data().lists;
        this.topics = [];
        lists.forEach(list => {
          const color = list.color;
          const title = list.title;
          const movieIDs = list.movieIDs;
          this.topics.push({ color, title, movieIDs });
        });
      });
  }

  sendPassResetEmail() {
    this.disabledSendButton = true;
    this.auth.sendPasswordResetEmail(this.user.email).then(() => {
      this.sendEmail = true;
      setTimeout(() => {
        this.sendEmail = false;
        this.disabledSendButton = false;
      }, 3000);
    })
      .catch(() => {
        this.sendEmail = false;
        this.disabledSendButton = false;
      });
      this.resetPassword = !this.resetPassword; 
  }
  selectEmoji(emojiIndex: number) {
    this.selectedEmoji = emojiIndex;
    this.user.avatar = this.emojis[emojiIndex];
  }
  submitChanges() {
    const saveusername = this.User.get('username').value;
    this.editing = false;

    if (saveusername) {
      if (this.selectedEmoji) {
        this.db.collection('users')
          .doc(this.user.fireUser.uid)
          .update({
            icon: this.emojiIDs[this.selectedEmoji],
            username: saveusername
          });
      }
      this.db.collection('users')
        .doc(this.user.fireUser.uid)
        .update({
          username: saveusername
        });
      this.user.name = saveusername;
    } else if (this.selectedEmoji && !saveusername) {
      this.db.collection('users')
        .doc(this.user.fireUser.uid)
        .update({
          icon: this.emojiIDs[this.selectedEmoji]
        });
    }

  }

}
