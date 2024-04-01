import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[transition-group-item]',
  standalone: true,
})
export class TransitionGroupItemDirective {
  el: HTMLElement;

  moveCallback: any;

  // setting to false to begin
  moved: boolean = false;

  newPos: any;

  prevPos: any;

  constructor(elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }
}
