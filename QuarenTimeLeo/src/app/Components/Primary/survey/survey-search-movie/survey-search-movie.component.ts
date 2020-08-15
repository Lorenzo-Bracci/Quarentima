import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Movie} from '../../../Class/Movie/movie';

@Component({
  selector: 'app-survey-search-movie',
  templateUrl: './survey-search-movie.component.html',
  styleUrls: ['./survey-search-movie.component.scss']
})
export class SurveySearchMovieComponent implements OnInit {
  @Input() Option1: boolean;
  @Input() WatchedList: Movie[];
  @Input() InSurveyComponent: boolean;

  @Output() movieEvent = new EventEmitter<Movie>();

  constructor() { }

  ngOnInit(): void {
  }

  setSelectedMovie(movie: Movie){
    this.movieEvent.emit(movie);
  }

}
