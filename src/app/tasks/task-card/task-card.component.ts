import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../Models/task.model';
import { TaskService } from '../../services/task.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsService } from '../../services/projects.service';
import { Project } from '../../projects/Models/project.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal.component';
import { HoverHighlightDirective } from '../../shared/directives/hover-highlight/hover-highlight.directive';
import { CapitalizePipe } from '../../shared/pipes/capitalize/capitalize.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatMenuModule, 
    MatIconModule, 
    MatButtonModule, 
    HoverHighlightDirective,
    CapitalizePipe
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnInit {
  @Input() task!: Task;
  @Input() project!: Project;
  @Input() projects: Project[] = [];
  @Input() allTasks: Task[] = [];
  projectName: string = '';

  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  constructor(
    private projectsService: ProjectsService, 
    private dialog: MatDialog,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.projectName = this.project?.title || 'Unknown Project';
  }

  openTaskDetail(): void {
    const relatedTasks = this.allTasks.filter(
      t => t.projectId === this.task.projectId && t.id !== this.task.id
    );

    this.dialog.open(TaskDetailModalComponent, {
      width: '600px',
      data: {
        task: this.task,
        project: this.project || this.projectsService.getProjectById(this.task.projectId),
        relatedTasks
      }
    });
  }

  showMenu = false;
 
  editTaskClicked(task: Task) {
    this.editTask.emit(task);
  }

  deleteTaskClicked(task: Task) {
    this.deleteTask.emit(task);
  }
}