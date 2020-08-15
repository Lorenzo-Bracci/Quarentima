import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MoviePageComponent } from '../movie-page/movie-page.component';
import { Movie } from '../../Class/Movie/movie';

@Component({
  selector: 'app-my-lists-movie',
  templateUrl: './my-lists-movie.component.html',
  styleUrls: ['./my-lists-movie.component.scss']
})
export class MyListsMovieComponent {
  @Input() isSelected: boolean;
  @Input() WatchedList: Movie[];

  constructor(public dialog: MatDialog) { }

  openMoviePage(movie: Movie): void {
    this.dialog.open(MoviePageComponent, {
      data: movie
    });
  }
}
