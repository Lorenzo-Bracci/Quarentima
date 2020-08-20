import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import 'firebase/auth';
import { environment } from '../../../../environments/environment';
import * as firebase from 'firebase';
firebase.initializeApp(environment.firebase); 
@Component({
  selector: 'app-startpage',
  templateUrl: './startpage.component.html',
  styleUrls: ['./startpage.component.scss']
})
export class StartpageComponent {

  constructor(private router: Router
    ,private auth: AngularFireAuth
    ) {}

  onSignup() {
    this.router.navigate(['/register']);
  }
  onLogin() {
    this.router.navigate(['/login']);
  }
  onTrial() {
    firebase.auth().signInWithEmailAndPassword("quarentimetcomk@hotmail.com", "helloworld").then((credential) => {
this.router.navigate([`/poll`]);
    })
    /*return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword("quarentimetcomk@hotmail.com", "helloworld")
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })*/
  }
  openInfo(){
    this.router.navigate(['/about']);
  }
}

