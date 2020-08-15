import {Component, EventEmitter, Input, Output} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MoviePageComponent } from '../movie-page/movie-page.component';
import { Movie } from '../../Class/Movie/movie';
import { ViewEncapsulation} from '@angular/core';


@Component({
  selector: 'app-picture-card',
  
  templateUrl: './picture-card.component.html',
  styleUrls: ['./picture-card.component.scss']
})
export class PictureCardComponent {

  @Input() movie: Movie;
  @Input() immutable = true;
  @Output() delete = new EventEmitter<boolean>();
  constructor(public dialog: MatDialog) { }

  openMoviePage(): void {
    this.dialog.open(MoviePageComponent, {
      data: this.movie
    });
  }

  emitDeleteEvent() {
    this.delete.emit();
  }
}


