import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() close: EventEmitter<string> = new EventEmitter();
  constructor() {}

  onChange(input: string) {
      this.inputChange.emit(input);
  }

}
