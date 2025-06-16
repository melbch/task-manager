import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Project } from '../../Models/project.model';
import { ProjectStatus } from '../../Models/project-status.enum';
import { Task } from '../../../tasks/Models/task.model';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsService } from '../../../services/projects.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatMenuModule, MatIconModule, MatButtonModule],
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

  constructor(private projectsService: ProjectsService, private router: Router) {}

  ngOnInit() {
    this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });
  }

  onProjectClicked(project: Project) {
    this.openProject.emit(project);
  }

  editProjectClicked(project: Project) {
    this.editProject.emit(project);
  }

  filteredProjectsByStatus(status: ProjectStatus): Project[] {
    if (this.visibleStatuses.length && !this.visibleStatuses.includes(status)) {
      return [];
    }
    let filtered = this.projects.filter(p => p.status === status);
    if (this.activeFilter !== null) {
      filtered = filtered.filter(p => p.status === this.activeFilter);
    }
    return filtered;
  }

  hasProjects(status: ProjectStatus): boolean {
    if (this.visibleStatuses.length && !this.visibleStatuses.includes(status)) {
      return false;
    }
    return this.filteredProjectsByStatus(status).length > 0;
  }

  toggleCollapsed(status: ProjectStatus): void {
    this.toggleSection.emit(status);
  }

  isCollapsed(status: ProjectStatus): boolean {
    return this.collapsedSections[status] ?? false;
  }

  deleteProjectClicked(project: Project) {
    const confirmed = confirm(`Are you sure you want to delete "${project.title}"?`);
    if (confirmed) {
      this.deleteProject.emit(project);
    }
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
