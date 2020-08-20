


import {Component, EventEmitter, Input, Output} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TrialMoviePageComponent } from '../trial-movie-page/trial-movie-page.component';
import { Movie } from '../../Class/Movie/movie';
import { ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'app-trial-picture-card',
  templateUrl: './trial-picture-card.component.html',
  styleUrls: ['./trial-picture-card.component.scss']
})
export class TrialPictureCardComponent {

  @Input() movie: Movie;
  @Input() immutable = true;
  @Output() delete = new EventEmitter<boolean>();
  constructor(public dialog: MatDialog) { }

  openMoviePage(): void {
    this.dialog.open(TrialMoviePageComponent, {
      data: this.movie
    });
  }

  emitDeleteEvent() {
    this.delete.emit();
  }
}


