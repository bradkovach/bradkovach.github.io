import type { AfterContentInit } from '@angular/core';

import { Component, contentChildren, effect, Input } from '@angular/core';

import { TransitionGroupItemDirective } from './transition-group-item.directive';

@Component({
	imports: [],
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: '[transition-group]',
	styles: [],
	template: '<ng-content></ng-content>',
})
export class TransitionGroupComponent implements AfterContentInit {
	@Input('transition-group') class = 'transition-group';

	// @ContentChildren(TransitionGroupItemDirective)
	// items!: QueryList<TransitionGroupItemDirective>;

	items = contentChildren(TransitionGroupItemDirective);

	itemEffect = effect(() => {
		const items = this.items();
		items.forEach((item: TransitionGroupItemDirective) => {
			item.prevPos = item.newPos ?? item.prevPos;
			this.runCallback(item);
			this.refreshPosition('newPos');
			this.applyTranslation(item);
			this.runTransition(item);
		});
	});

	applyTranslation(item: TransitionGroupItemDirective) {
		item.moved = false;
		const dx =
			item.prevPos && item.newPos
				? item.prevPos.left - item.newPos.left
				: 0;
		const dy =
			item.prevPos && item.newPos
				? item.prevPos.top - item.newPos.top
				: 0;
		if (dx || dy) {
			item.moved = true;
			const style = item.el.style;
			style.transform = style.webkitTransform =
				'translate(' + dx + 'px,' + dy + 'px)';
			style.transitionDuration = '0s';
		}
	}

	ngAfterContentInit() {
		this.refreshPosition('prevPos');
		// this.items().changes.subscribe((items) => {
		// 	items.forEach((item: TransitionGroupItemDirective) => {
		// 		item.prevPos = item.newPos ?? item.prevPos;
		// 	});

		// 	items.forEach((item) => this.runCallback(item));
		// 	this.refreshPosition('newPos');
		// 	items.forEach(this.applyTranslation);

		// 	// force reflow to put everything in position
		// 	this.items.forEach(this.runTransition.bind(this));
		// });
	}

	refreshPosition(prop: keyof TransitionGroupItemDirective) {
		this.items().forEach((item: TransitionGroupItemDirective) => {
			item[prop] = item.el.getBoundingClientRect();
		});
	}

	runCallback(item: TransitionGroupItemDirective) {
		if (item.moveCallback) {
			item.moveCallback();
		}
	}

	runTransition(item: TransitionGroupItemDirective) {
		if (!item.moved) {
			return;
		}
		const cssClass = this.class + '-move';
		const el = item.el;
		const style: CSSStyleDeclaration = el.style;
		el.classList.add(cssClass);
		style.transform = style.webkitTransform = style.transitionDuration = '';
		el.addEventListener(
			'transitionend',
			(item.moveCallback = (e?: TransitionEvent) => {
				if (!e || e.propertyName.endsWith('transform')) {
					el.removeEventListener('transitionend', item.moveCallback!);
					item.moveCallback = null;
					el.classList.remove(cssClass);
				}
			}),
		);
	}
}
