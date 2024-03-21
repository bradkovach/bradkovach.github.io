import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-integer',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './integer.component.html',
  styleUrl: './integer.component.scss',
})
export class IntegerComponent {
  private _max: number = Number.MAX_SAFE_INTEGER;
  private _min: number = Number.MIN_SAFE_INTEGER;
  private _step: number = 1;
  private _value: number = 0;

  @Output() valueChange = new EventEmitter<number>();

  @Input() set max(max: number) {
    this._max = max;
  }

  @Input() set min(min: number) {
    this._min = min;
  }

  @Input() set step(increment: number) {
    this._step = increment;
  }

  @Input() set value(value: number) {
    this._value = value;
    this.valueChange.emit(this._value);
  }

  get max(): number {
    return this._max;
  }

  get min(): number {
    return this._min;
  }

  get step(): number {
    return this._step;
  }

  get value(): number {
    return this._value;
  }

  private _ctrlCoefficient: number = 1;

  @Input('ctrl') set ctrlCoefficient(ctrlCoefficient: number) {
    this._ctrlCoefficient = ctrlCoefficient;
  }

  get ctrlCoefficient(): number {
    return this._ctrlCoefficient;
  }

  private _shiftCoefficient: number = 1;

  @Input('shift') set shiftCoefficient(shiftCoefficient: number) {
    this._shiftCoefficient = shiftCoefficient;
  }

  get shiftCoefficient(): number {
    return this._shiftCoefficient;
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
}
