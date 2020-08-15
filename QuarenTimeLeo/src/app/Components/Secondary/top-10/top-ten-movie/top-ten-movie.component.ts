import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MoviePageComponent } from '../../movie-page/movie-page.component';
import {MovieAPI} from '../../../Class/MovieAPI/movie-api';
import {Movie} from '../../../Class/Movie/movie';

@Component({
  selector: 'app-top-ten-movie',
  templateUrl: './top-ten-movie.component.html',
  styleUrls: ['./top-ten-movie.component.scss']
})
export class TopTenMovieComponent implements OnInit {

  topTenMovies: Movie[];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    MovieAPI.getUpcoming().then(movies => {
      this.topTenMovies = movies;
    });

    
  }
  openMoviePage(movie: Movie): void {
    this.dialog.open(MoviePageComponent, {
      data: movie
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      console.log('same');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log('dif');
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

}
