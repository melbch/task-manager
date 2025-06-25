import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent<T> {
  @Input() categories: T[] = [];
  @Input() disabledCategories: T[] = [];
  @Input() selectedCategory: T | null = null;

  @Output() categoryChange = new EventEmitter<T | null>();

  selectCategory(category: T | null): void {
    if (this.selectedCategory === category) {
      this.categoryChange.emit(null);
    } else {
      this.categoryChange.emit(category);
    }
  }
}

//used in tasks.component.ts & projects.component.ts