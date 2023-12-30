import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[transition-group-item]',
  standalone: true,
})
export class TransitionGroupItemDirective {
  prevPos: any;

  newPos: any;

  el: HTMLElement;

  // setting to false to begin
  moved: boolean = false;

  moveCallback: any;

  constructor(elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }
}
