import { Directive, ElementRef, inject } from '@angular/core';

type Position = {
	height: number;
	left: number;
	top: number;
	width: number;
};

type TransitionEventListener = (event?: TransitionEvent) => void;

@Directive({
	selector: '[transition-group-item]',
	standalone: true,
})
export class TransitionGroupItemDirective implements Record<string, unknown> {
	[x: string]: unknown;
	private elRef: ElementRef = inject<ElementRef<HTMLElement>>(
		ElementRef<HTMLElement>,
	);

	el: HTMLElement = this.elRef.nativeElement;

	moveCallback: null | TransitionEventListener = null;

	// setting to false to begin
	moved = false;

	newPos?: Position;

	prevPos?: Position;
}
