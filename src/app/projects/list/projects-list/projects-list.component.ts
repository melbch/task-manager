import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Project } from '../../Models/project.model';
import { ProjectStatus } from '../../Models/project-status.enum';
import { Task } from '../../../tasks/Models/task.model';
import { FilterByStatusPipe } from '../../../shared/pipes/filter-by-status/filter-by-status.pipe';
import { ProjectsService } from '../../../services/projects.service';
import { HoverHighlightDirective } from '../../../shared/directives/hover-highlight/hover-highlight.directive';
import { CapitalizePipe } from '../../../shared/pipes/capitalize/capitalize.pipe';
import { DialogService } from '../../../shared/services/dialog.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatProgressBarModule, 
    MatMenuModule, 
    MatIconModule, 
    MatButtonModule,
    FilterByStatusPipe,
    HoverHighlightDirective,
    CapitalizePipe
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss'
})
export class ProjectsListComponent implements OnInit {
  @Input() projects: Project[] = [];
  @Input() activeFilter: ProjectStatus | null = null;
  @Input() collapsedSections: Record<string, boolean> = {};
  @Input() visibleStatuses: ProjectStatus[] = [];
  @Input() tasks: Task[] = [];

  @Output() toggleSection = new EventEmitter<ProjectStatus>();
  @Output() openProject = new EventEmitter<Project>();
  @Output() editProject = new EventEmitter<Project>();
  @Output() deleteProject = new EventEmitter<Project>();

  allStatuses = Object.values(ProjectStatus);

  constructor(
    private projectsService: ProjectsService, 
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
  
  }

  onProjectClicked(project: Project) {
    this.openProject.emit(project);
  }

  editProjectClicked(project: Project) {
    this.editProject.emit(project);
  }

  toggleCollapsed(status: ProjectStatus): void {
    this.toggleSection.emit(status);
  }

  isCollapsed(status: ProjectStatus): boolean {
    return this.collapsedSections[status] ?? false;
  }

  deleteProjectClicked(project: Project) {
    this.dialogService
      .confirm('Delete Project', `Are you sure you want to delete "${project.title}"?`)
      .subscribe(confirmed => {
        if (confirmed) {
          this.deleteProject.emit(project); // emit only if confirmed
        }
      });
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

  getCompletion(project: Project): number {
    if (!this.tasks || this.tasks.length === 0) return 0;

    const relatedTasks = this.tasks.filter(t => t.projectId === project.id);
    if (relatedTasks.length === 0) return 0;

    const completedCount = relatedTasks.filter(t => t.completed).length;
    return (completedCount / relatedTasks.length) * 100;
  }
}
