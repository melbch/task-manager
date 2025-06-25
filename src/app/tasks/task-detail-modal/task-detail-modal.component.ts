import { Component, Inject, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ProjectDetailModalComponent } from '../../projects/project-detail-modal/project-detail-modal.component';
import { Task } from '../Models/task.model';
import { TaskService } from '../../services/task.service';
import { Project } from '../../projects/Models/project.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DialogService } from '../../shared/services/dialog.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule
  ],
  templateUrl: './task-detail-modal.component.html',
  styleUrl: './task-detail-modal.component.scss'
})
export class TaskDetailModalComponent {
  
  data = inject(MAT_DIALOG_DATA) as {
    task: Task;
    project: Project;
    relatedTasks: Task[];
  };

  private dialogRef = inject(MatDialogRef<TaskDetailModalComponent>);
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  task = signal<Task>(this.data.task);
  project: Project = this.data.project;
  relatedTasks: Task[] = this.data.relatedTasks;

  tasksSignal = this.taskService.tasks;

  constructor() {
    //reactively update task when tasks list changes
    effect(() => {
      const allTasks = this.tasksSignal();
      const updated = allTasks.find((t: Task) => t.id === this.task().id);
      if (updated) {
        this.task.set(updated);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  goToProject() {
    this.dialogRef.close();

    const projectTasks = this.taskService.getTasksForProject(this.project.id);

    this.dialog.open(ProjectDetailModalComponent, {
      width: '600px',
      data: { 
        project: this.project, 
        tasks: projectTasks
      }
    });
  }

  openTaskModal(task: Task) {
    const project = this.project;
    const relatedTasks = this.relatedTasks.filter(t => t.id !== task.id);

    this.dialogRef.close();

    this.dialog.open(TaskDetailModalComponent, {
      width: '600px',
      data: { task, project, relatedTasks }
    });
  }

  editTask(task: Task) {
    this.dialogRef.close();
    
    setTimeout(() => {
      this.router.navigate(['/tasks/edit', task.id]).then(success => {
        if (!success) {
          console.error('Navigation failed!');
        }
      });
    }, 0);
  }

  deleteTask(task: Task): void {
    this.dialogService
      .confirm('Delete Task', `Are you sure you want to delete the task "${task.title}"?`)
      .subscribe(confirmed => {
        if (confirmed) {
          this.taskService.deleteTask(task.id);
          this.dialogRef.close();
        }
      });
  }
}