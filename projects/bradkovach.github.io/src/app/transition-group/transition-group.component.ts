import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { TransitionGroupItemDirective } from './transition-group-item.directive';

@Component({
  imports: [],
  selector: '[transition-group]',
  standalone: true,
  styles: [],
  template: '<ng-content></ng-content>',
})
export class TransitionGroupComponent {
  @Input('transition-group') class: string = 'transition-group';

  @ContentChildren(TransitionGroupItemDirective)
  items!: QueryList<TransitionGroupItemDirective>;

  applyTranslation(item: TransitionGroupItemDirective) {
    item.moved = false;
    const dx = item.prevPos.left - item.newPos.left;
    const dy = item.prevPos.top - item.newPos.top;
    if (dx || dy) {
      item.moved = true;
      const style: any = item.el.style;
      style.transform = style.WebkitTransform =
        'translate(' + dx + 'px,' + dy + 'px)';
      style.transitionDuration = '0s';
    }
  }

  ngAfterContentInit() {
    this.refreshPosition('prevPos');
    this.items.changes.subscribe((items) => {
      items.forEach((item: TransitionGroupItemDirective) => {
        item.prevPos = item.newPos || item.prevPos;
      });

      items.forEach(this.runCallback);
      this.refreshPosition('newPos');
      items.forEach(this.applyTranslation);

      // force reflow to put everything in position
      const offSet = document.body.offsetHeight;
      this.items.forEach(this.runTransition.bind(this));
    });
  }

  refreshPosition(prop: keyof TransitionGroupItemDirective) {
    this.items.forEach((item: TransitionGroupItemDirective) => {
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
    const style: any = el.style;
    el.classList.add(cssClass);
    style.transform = style.WebkitTransform = style.transitionDuration = '';
    el.addEventListener(
      'transitionend',
      (item.moveCallback = (e: any) => {
        if (!e || /transform$/.test(e.propertyName)) {
          el.removeEventListener('transitionend', item.moveCallback);
          item.moveCallback = null;
          el.classList.remove(cssClass);
        }
      }),
    );
  }
}
