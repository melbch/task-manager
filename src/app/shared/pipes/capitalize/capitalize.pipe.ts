import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true,
  pure: true,
})
@Injectable({ providedIn: 'root' }) 
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const normalized = value.normalize('NFC');

    return normalized.replace(/\b\w+/g, word => {
      const firstChar = word.charAt(0).toLocaleUpperCase();
      const rest = word.slice(1).toLocaleLowerCase();
      return firstChar + rest;
    });
  }
}

//used in project-create & task-create components
//also used in tasks-list & projects-list
//task-card & project-card