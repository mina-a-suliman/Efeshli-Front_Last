import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating">
      <span 
        *ngFor="let star of stars; let i = index" 
        class="star" 
        [class.filled]="i < value"
        [class.disabled]="disabled"
        (click)="!disabled && setValue(i + 1)"
        (mouseover)="!disabled && (hoverValue = i + 1)"
        (mouseleave)="!disabled && (hoverValue = 0)"
      >
        ★
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-block;
      font-size: 1.5rem;
    }
    .star {
      color: #ccc;
      cursor: pointer;
      transition: color 0.2s;
      margin-right: 2px;
    }
    .star.filled {
      color: #ffc107;
    }
    .star:hover:not(.disabled) {
      color: #ffc107;
    }
    .star.disabled {
      cursor: default;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true
    }
  ]
})
export class StarRatingComponent implements ControlValueAccessor {
  @Input() value = 0;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<number>();
  
  hoverValue = 0;
  stars = [1, 2, 3, 4, 5];
  
  onChange: any = () => {};
  onTouched: any = () => {};

  setValue(value: number) {
    this.value = value;
    this.valueChange.emit(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}