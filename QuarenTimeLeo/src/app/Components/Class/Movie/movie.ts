export class Movie {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly poster: string;
  readonly background: string;
  readonly genres: string[];
  readonly rating: string;

  constructor(id: number, title: string,
              description: string, poster: string,
              background: string, genres: string[],
              rating: number) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.poster = poster;
    this.background = background;
    this.genres = genres;
    this.rating = rating ? `${rating}` : '';
  }
}
