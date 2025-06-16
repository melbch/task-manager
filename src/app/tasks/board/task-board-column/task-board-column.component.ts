import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../projects/Models/project.model';
import { ProjectStatus } from '../../../projects/Models/project-status.enum';
import { Task } from '../../Models/task.model';
import { TaskStatus } from '../../Models/task-status.enum';
import { TaskCardComponent } from '../../task-card/task-card.component';

@Component({
  selector: 'app-task-board-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-board-column.component.html',
  styleUrl: './task-board-column.component.scss'
})
export class TaskBoardColumnComponent {
  @Input() status!: TaskStatus;
  @Input() tasks: Task[] = [];
  @Input() projects: Project[] = [];
  @Input() collapsed = false;

  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  getProjectForTask(task: Task): Project {
    const project = this.projects.find(p => p.id === task.projectId);
    if (!project) {
      //return default/fallback 
      return {
        id: 'unknown',
        title: 'Unknown Project',
        dueDate: new Date(),
        tags: [],
        status: ProjectStatus.ToDo,
      };
    }
    return project;
  }

  onEditTask(task: Task) {
    this.editTask.emit(task);
  }

  onDeleteTask(task: Task) {
    this.deleteTask.emit(task);
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  getColor(status: TaskStatus): string {
    const colors = {
      'Planning': '#3B82F6',
      'To Do': '#F59E0B',
      'In Progress': '#10B981',
      'In Review': '#6366F1',
      'Completed': '#22C55E',
      'Paused': '#FBBF24',
      'Cancelled': '#EF4444',
    };
    return colors[status] || '#ddd';
  }
}