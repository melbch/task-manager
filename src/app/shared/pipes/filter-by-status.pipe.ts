import { Pipe, PipeTransform } from '@angular/core';
import { Project } from '../../projects/Models/project.model';

@Pipe({
  name: 'filterByStatus',
  pure: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(items: Project[], status: string): Project[] {
    if (!items || !status) return items;
    return items.filter(item => item.status === status);
  }
}
