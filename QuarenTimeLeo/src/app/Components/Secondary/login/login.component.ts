import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage = '';
  user = new FormGroup({
  email: new FormControl(),
  password: new FormControl()
  });

  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore) { }

  login(): void {
    this.errorMessage = '';
    const actaulRouter = this.router;
    const eml = this.user.get('email').value;
    const psd = this.user.get('password').value;
    // The persistency login is not working properly.
    // please check ========> https://firebase.google.com/docs/auth/web/auth-state-persistence

    this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL) // sesssion, Local, none.
      .then( () => {
        return firebase.auth().signInWithEmailAndPassword(eml, psd).then((credential) => {
         // if (credential.user.emailVerified) {
            fetch('http://localhost:3000/load-list/?email=' + eml).then(function (response) {
            return response.json();
        }).then(function (data) {
                if (data.takenSurvey) {
                  actaulRouter.navigate([`/mainpage`]);
                } else {
                  actaulRouter.navigate([`/poll`]);
                }
              });
          /*} else { // if the account is not verified we log out the user
            this.errorMessage = 'your account is not verified, check your email';
            this.auth.signOut().catch((e) => console.log(e));
          }*/
        })
          .catch((e) => this.errorMessage = 'Incorrect email / password combination!');

      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });

    // reset all the values in the form
    this.user.reset();

  }

  onSignup() {
    this.router.navigate(['/register']);
  }
}
