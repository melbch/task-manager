import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Project } from '../Models/project.model';
import { ProjectsService } from '../../services/projects.service';
import { Task } from '../../tasks/Models/task.model';
import { TaskDetailModalComponent } from '../../tasks/task-detail-modal/task-detail-modal.component';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-project-detail-modal',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatMenuModule, MatIconModule, MatDialogModule],
  templateUrl: './project-detail-modal.component.html',
  styleUrl: './project-detail-modal.component.scss'
})
export class ProjectDetailModalComponent {
  project: Project;
  tasks: Task[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { project: Project; tasks: Task[] },
    private dialogRef: MatDialogRef<ProjectDetailModalComponent>,
    private dialog: MatDialog,
    private projectsService: ProjectsService
  ) {
    this.project = data.project;
    this.tasks = data.tasks;
  }

  close() {
    this.dialogRef.close();
  }

  openTaskDetail(task: Task) {
    this.dialogRef.close();

    const relatedTasks = this.tasks.filter(t => t.projectId === this.project.id && t.id !== task.id);

    this.dialog.open(TaskDetailModalComponent, {
      width: '600px',
      data: {
        task,
        project: this.project,
        relatedTasks
      }
    });
  }

  computeCompletion(): number {
    if (!this.tasks.length) return 0;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    return (completedTasks / this.tasks.length) * 100;
  }

  editProject(project: Project) {
    console.log('Editing project:', this.project);
    // implement edit logic or emit an event
  }

  deleteProject(project: Project) {
    const confirmed = confirm(`Are you sure you want to delete "${project.title}"?`);
    if (confirmed) {
      this.projectsService.deleteProject(project.id);
    }
  }
}