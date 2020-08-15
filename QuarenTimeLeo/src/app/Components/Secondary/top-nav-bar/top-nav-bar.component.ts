import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-top-nav-bar',
  templateUrl: './top-nav-bar.component.html',
  styleUrls: ['./top-nav-bar.component.scss']
})
export class TopNavBarComponent {

  @Output() searchInputChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() hideButtons = false;
  @Input() hideSearch = false; 

  constructor() {}

  emitInputChange(input) {
    this.searchInputChange.emit(input);
  }

}
