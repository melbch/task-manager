import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../Models/project.model';
import { ProjectStatus } from '../../Models/project-status.enum';
import { ProjectCardComponent } from '../../project-card/project-card.component';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss'
})
export class BoardColumnComponent {
  @Input() status!: ProjectStatus;
  @Input() projects: Project[] = [];
  @Input() collapsed = false;

  @Output() editProject = new EventEmitter<Project>();
  @Output() deleteProject = new EventEmitter<Project>();

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  getColor(status: ProjectStatus): string {
    const colors = {
      'Planning': '#3B82F6',
      'To Do': '#F59E0B',
      'In Progress': '#10B981',
      'In Review': '#6366F1',
      'Completed': '#22C55E',
      'Paused': '#FBBF24',
      'Cancelled': '#EF4444',
    };
    return colors[status] || '#eee';
  }
}
