import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByStatus',
  pure: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform<T extends { status?: string}>(items: T[], status: string | null): T[] {
    if (!items) return [];
    if (!status || status === 'all') return items;
    return items.filter(item => item.status === status);
  }
}

//used in tasks-list + tasks-board components
//also in projects-list + projects-board components