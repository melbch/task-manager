import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from './Models/project.model';
import { ProjectStatus } from './Models/project-status.enum';
import { ProjectsService } from '../services/projects.service';
import { ProjectsBoardComponent } from './board/projects-board/projects-board.component';
import { ProjectsListComponent } from './list/projects-list/projects-list.component';
import { Task } from '../tasks/Models/task.model';
import { TaskService } from '../services/task.service';
import { ProjectDetailModalComponent } from './project-detail-modal/project-detail-modal.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectsBoardComponent, ProjectsListComponent, MatTooltipModule, MatIconModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  allStatuses = Object.values(ProjectStatus);
  projects: Project[] = [];
  tasks: Task[] = [];
  activeFilter: ProjectStatus | null = null;
  
  selectedProject?: Project;
  isEditMode = false;

  currentView: 'board' | 'list' = 'board';

  constructor(
    private projectsService: ProjectsService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    //subscribe to projects observable to get live updates
    this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });

    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    })
  }

  onEditProject(project: Project) {
    this.router.navigate(['/projects/edit', project.id]);
  }

  onDeleteProject(project: Project) {
    this.projectsService.deleteProject(project.id);
  }

  onProjectFormSubmit(project: Project) {
    if (this.isEditMode) {
      this.projectsService.updateProject(project);
    } else {
      this.projectsService.addProject(project);
    }
    this.resetForm();
  }

  onCancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.selectedProject = undefined;
    this.isEditMode = false;
  }

  openProjectModal(project: Project) {
    const projectTasks = this.tasks.filter(task => task.projectId === project.id);

    this.dialog.open(ProjectDetailModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { 
        project,
        tasks: projectTasks 
      }
    });
  }

  collapsedSections: Record<ProjectStatus, boolean> = Object.values(ProjectStatus)
    .reduce((acc, status) => {
      acc[status] = false;
      return acc;
    }, {} as Record<ProjectStatus, boolean>);

  onToggleSection(status: ProjectStatus): void {
    this.collapsedSections[status] = !this.collapsedSections[status];
  }

  filteredProjectsByStatus(status: ProjectStatus): Project[] {
    if (this.activeFilter && this.activeFilter !== status) return [];
    return this.projects.filter(p => p.status === status);
  }

  hasProjects(status: ProjectStatus): boolean {
    return this.filteredProjectsByStatus(status).length > 0;
  }

  toggleFilter(status: ProjectStatus): void {
    this.activeFilter = this.activeFilter === status ? null : status;
  }

  isVisible(status: ProjectStatus): boolean {
    if (this.activeFilter === null) return this.hasProjects(status);
    return this.activeFilter === status;
  }

  get visibleStatuses(): ProjectStatus[] {
    return this.allStatuses.filter(status => this.isVisible(status));
  }
}