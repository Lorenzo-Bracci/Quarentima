import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-restorepassword',
  templateUrl: './restorepassword.component.html',
  styleUrls: ['./restorepassword.component.scss']
})
export class RestorepasswordComponent {
  errorMessage = '';
  user = new FormGroup({
    email: new FormControl(),
  });

  constructor(
      public auth: AngularFireAuth,
      private router: Router) {}

  sendresetemail(): void {
    this.errorMessage = '';
    this.auth.sendPasswordResetEmail(this.user.get('email').value)
    .then(() => {
      this.router.navigate(['/login']);
    })
    .catch((e) => {
      switch (e.code) {
        case 'auth/invalid-email':
          this.errorMessage = 'EMAIL WITH WRONG FORMAT';
          break;
        case 'auth/user-not-found':
          this.errorMessage = 'THE EMAIL ADDRESS IS NOT IN USE';
          break;
        default:
          console.log(e);
      }
    });
    this.user.reset(); // reset all the values in the form
  }
}
