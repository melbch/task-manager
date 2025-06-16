import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../Models/project.model';
import { ProjectStatus } from '../../Models/project-status.enum';
import { BoardColumnComponent } from '../board-column/board-column.component';

@Component({
  selector: 'app-projects-board',
  standalone: true,
  imports: [CommonModule, BoardColumnComponent],
  templateUrl: './projects-board.component.html',
  styleUrl: './projects-board.component.scss'
})
export class ProjectsBoardComponent {
  @Input() projects: Project[] = [];
  @Input() visibleStatuses: ProjectStatus[] = [];

  @Output() editProject = new EventEmitter<Project>();
  @Output() deleteProject = new EventEmitter<Project>();

  filteredProjectsByStatus(status: ProjectStatus): Project[] {
    return this.projects.filter(p => p.status === status);
  }

  onEditProject(project: Project) {
    this.editProject.emit(project);
  }

  onDeleteProject(project: Project) {
    this.deleteProject.emit(project);
  } 
}