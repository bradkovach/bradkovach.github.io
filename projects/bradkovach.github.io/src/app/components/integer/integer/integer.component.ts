import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  imports: [DecimalPipe],
  selector: 'app-integer',
  standalone: true,
  styleUrl: './integer.component.scss',
  templateUrl: './integer.component.html',
})
export class IntegerComponent {
  private _ctrlCoefficient: number = 1;
  private _max: number = Number.MAX_SAFE_INTEGER;
  private _min: number = Number.MIN_SAFE_INTEGER;
  private _shiftCoefficient: number = 1;

  private _step: number = 1;

  private _value: number = 0;

  @Output() valueChange = new EventEmitter<number>();

  @Input('ctrl') set ctrlCoefficient(ctrlCoefficient: number) {
    this._ctrlCoefficient = ctrlCoefficient;
  }

  get ctrlCoefficient(): number {
    return this._ctrlCoefficient;
  }

  decrement(event: MouseEvent) {
    let coefficient = 1;

    if (event.ctrlKey || event.metaKey) {
      coefficient = coefficient * this._ctrlCoefficient;
    }

    if (event.shiftKey) {
      coefficient = coefficient * this._shiftCoefficient;
    }

    if (this._value > this._min) {
      const maybeValue = this._value - coefficient * this._step;
      this.value = Math.max(maybeValue, this._min);
    }
  }

  increment(event: MouseEvent) {
    let coefficient = 1;
    if (event.ctrlKey || event.metaKey) {
      coefficient = coefficient * this._ctrlCoefficient;
    }

    if (event.shiftKey) {
      coefficient = coefficient * this._shiftCoefficient;
    }

    if (this._value < this._max) {
      const maybeValue = this._value + coefficient * this._step;
      this.value = Math.min(maybeValue, this._max);
    }
  }

  @Input() set max(max: number) {
    this._max = max;
  }

  get max(): number {
    return this._max;
  }

  @Input() set min(min: number) {
    this._min = min;
  }

  get min(): number {
    return this._min;
  }

  @Input('shift') set shiftCoefficient(shiftCoefficient: number) {
    this._shiftCoefficient = shiftCoefficient;
  }

  get shiftCoefficient(): number {
    return this._shiftCoefficient;
  }

  @Input() set step(increment: number) {
    this._step = increment;
  }

  get step(): number {
    return this._step;
  }

  @Input() set value(value: number) {
    this._value = value;
    this.valueChange.emit(this._value);
  }

  get value(): number {
    return this._value;
  }
}
