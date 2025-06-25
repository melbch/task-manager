import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Task } from './Models/task.model';
import { TaskStatus } from './Models/task-status.enum';
import { TasksBoardComponent } from './board/tasks-board/tasks-board.component';
import { TasksListComponent } from './list/tasks-list/tasks-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FilterBarComponent } from '../shared/components/filter-bar/filter-bar/filter-bar.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    TasksBoardComponent,
    TasksListComponent,
    MatTooltipModule,
    MatIconModule,
    FilterBarComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  allStatuses = Object.values(TaskStatus);
  tasks: Task[] = [];
  activeFilter: TaskStatus | null = null;
  selectedTask: Task | null = null;
  isEditMode = false;

  currentView: 'board' | 'list' = 'list';

  constructor(
    private taskService: TaskService, 
    private router: Router
  ) {}
  
  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  onEditTask(task: Task) {
    this.selectedTask = { ...task };
    this.isEditMode = true;
    this.router.navigate(['/tasks/edit', task.id]);
  }

  collapsedSections: Record<TaskStatus, boolean> = Object.values(TaskStatus)
    .reduce((acc, status) => {
      acc[status] = false;
      return acc;
    }, {} as Record<TaskStatus, boolean>);

  onToggleSection(status: TaskStatus): void {
    this.collapsedSections[status] = !this.collapsedSections[status];
  }

  toggleFilter(status: TaskStatus): void {
    this.activeFilter = this.activeFilter === status ? null : status;
  }

  onCategoryChange(newFilter: string | null) {
    if (newFilter === null) {
      this.activeFilter = null;
      return;
    }

    if (this.allStatuses.includes(newFilter as TaskStatus)) {
      this.activeFilter = newFilter as TaskStatus;
    } else {
      console.warn(`Invalid task status received: ${newFilter}`);
      this.activeFilter = null;
    }
  }

  getDisabledStatuses(): TaskStatus[] {
    return this.allStatuses.filter(
      status => !this.tasks.some(task => task.status === status)
    );
  }

  isVisible(status: TaskStatus): boolean {
    if (this.activeFilter === null) {
      return this.tasks.some(t => t.status === status);
    }
    return this.activeFilter === status;
  }

  get visibleStatuses(): TaskStatus[] {
    return this.allStatuses.filter(status => this.isVisible(status));
  }
}