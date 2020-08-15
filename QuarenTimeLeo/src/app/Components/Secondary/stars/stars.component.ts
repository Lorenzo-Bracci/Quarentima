import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.scss']
})
export class StarsComponent {

  constructor(private router: Router) {}

  onStart() {
    this.router.navigateByUrl('/start');
  }
}
