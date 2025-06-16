import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Project } from '../../../projects/Models/project.model';
import { Task } from '../../../tasks/Models/task.model';

@Component({
  selector: 'app-item-card',
  imports: [],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss'
})
export class ItemCardComponent {
  @Input() item!: Project | Task;
  @Input() itemType!: 'project' | 'task';

  @Output() edit = new EventEmitter<Project | Task>();
  @Output() delete = new EventEmitter<Project | Task>();

  onEditClicked() {
    this.edit.emit(this.item);
  }

  onDeleteClicked() {
    this.delete.emit(this.item);
  }
}
