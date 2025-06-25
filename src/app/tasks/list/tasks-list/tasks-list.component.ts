import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../Models/task.model';
import { TaskStatus } from '../../Models/task-status.enum';
import { ProjectsService } from '../../../services/projects.service';
import { TaskService } from '../../../services/task.service';
import { TaskDetailModalComponent } from '../../task-detail-modal/task-detail-modal.component';
import { FilterByStatusPipe } from '../../../shared/pipes/filter-by-status/filter-by-status.pipe';
import { HoverHighlightDirective } from '../../../shared/directives/hover-highlight/hover-highlight.directive';
import { CapitalizePipe } from '../../../shared/pipes/capitalize/capitalize.pipe';
import { DialogService } from '../../../shared/services/dialog.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatProgressBarModule, 
    MatMenuModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCheckboxModule,
    FilterByStatusPipe,
    HoverHighlightDirective,
    CapitalizePipe
  ],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss'
})
export class TasksListComponent implements OnInit {
  @Input() activeFilter: TaskStatus | null = null;
  @Input() collapsedSections: Record<string, boolean> = {};
  @Input() visibleStatuses: TaskStatus[] = [];
  @Input() tasks: Task[] = [];

  @Output() toggleSection = new EventEmitter<TaskStatus>();

  allStatuses = Object.values(TaskStatus);

  constructor(
    private projectsService: ProjectsService, 
    private dialog: MatDialog,
    private taskService: TaskService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    
  }

  getProjectName(projectId: string): string {
    const project = this.projectsService.getProjectById(projectId);
    return project ? project.title : 'Unknown Project';
  }

  openTaskDetail(task: Task) {
    const project = this.projectsService.getProjectById(task.projectId);
    const relatedTasks = this.taskService
      .getTasksForProject(task.projectId)
      .filter(t => t.id !== task.id);

    this.dialog.open(TaskDetailModalComponent, {
      width: '600px',
      data: {
        task,
        project,
        relatedTasks
      }
    });
  }

  toggleCollapsed(status: TaskStatus): void {
    this.toggleSection.emit(status);
  }

  isCollapsed(status: TaskStatus): boolean {
    return this.collapsedSections[status] ?? false;
  }

  toggleCompleted(task: Task, isCompleted: boolean) {
    task.completed = isCompleted;
    task.completion = isCompleted ? 100 : 0;
    this.taskService.updateTask(task);
  }

  editTask(task: Task) {
    this.router.navigate(['/tasks/edit', task.id]);
  } 

  deleteTask(task: Task): void {
    this.dialogService
      .confirm('Delete Task', `Are you sure you want to delete the task "${task.title}"?`)
      .subscribe(confirmed => {
        if (confirmed) {
          this.taskService.deleteTask(task.id);
        }
      });
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
    return colors[status] || '#eee';
  }

}
