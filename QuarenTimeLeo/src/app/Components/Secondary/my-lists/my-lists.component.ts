import { Component, OnInit } from '@angular/core';
import { Movie } from '../../Class/Movie/movie';
import { MovieAPI } from '../../Class/MovieAPI/movie-api';
import { MatDialog } from '@angular/material/dialog';
import { MoviePageComponent } from '../movie-page/movie-page.component';
import { ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-my-lists',
  encapsulation: ViewEncapsulation.None ,
  templateUrl: './my-lists.component.html',
  styleUrls: ['./my-lists.component.scss']
})
export class MyListsComponent implements OnInit {
  selectedCategoryIndex = 0;

  MostPopularList: Movie[] = [];
  NewMovies: Movie[] = [];
  showedMovies: Movie[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    MovieAPI.getMostPopular().then(movies => {
      this.MostPopularList = movies;
      this.showedMovies = movies;
    });
    MovieAPI.getUpcoming().then(movies => {
      this.NewMovies = movies;
    });
  }

  openMoviePage(movie: Movie): void {
    this.dialog.open(MoviePageComponent, {
      data: movie
    });
    console.log('my-lists')
  }

  changeSelectedCategory(index: number) {
    this.selectedCategoryIndex = index;
    this.showedMovies = index === 0 ? this.MostPopularList : this.NewMovies;
  }
}
