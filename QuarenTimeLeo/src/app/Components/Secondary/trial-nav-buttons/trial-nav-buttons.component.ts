


import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-trial-nav-buttons',
  templateUrl: './trial-nav-buttons.component.html',
  styleUrls: ['./trial-nav-buttons.component.scss']
})
export class TrialNavButtonsComponent {

  @Output() searchInputChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() hideButtons = false;
  @Input() hideSearch = false; 

  constructor() {}

  emitInputChange(input) {
    this.searchInputChange.emit(input);
  }

}
