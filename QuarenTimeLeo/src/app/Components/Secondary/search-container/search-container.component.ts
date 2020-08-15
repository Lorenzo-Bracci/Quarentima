import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Movie} from '../../Class/Movie/movie';
import {MovieAPI} from '../../Class/MovieAPI/movie-api';

@Component({
  selector: 'app-search-container',
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.scss']
})
export class SearchContainerComponent implements OnChanges {

  @Input() input = '';
  movies: Movie[] = [];
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.input && changes.input.currentValue) {
      MovieAPI.search(changes.input.currentValue).then(result => {
        this.movies = result;
      });
    }
  }

}
