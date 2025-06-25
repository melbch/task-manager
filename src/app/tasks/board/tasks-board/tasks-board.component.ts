import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../../Models/task.model';
import { TaskService } from '../../../services/task.service';
import { Project } from '../../../projects/Models/project.model';
import { ProjectsService } from '../../../services/projects.service';
import { TaskStatus } from '../../Models/task-status.enum';
import { TaskBoardColumnComponent } from '../task-board-column/task-board-column.component';
import { FilterByStatusPipe } from '../../../shared/pipes/filter-by-status/filter-by-status.pipe';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [
    CommonModule, 
    TaskBoardColumnComponent,
    FilterByStatusPipe
  ],
  templateUrl: './tasks-board.component.html',
  styleUrl: './tasks-board.component.scss'
})
export class TasksBoardComponent implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() projects: Project[] = [];
  @Input() visibleStatuses: TaskStatus[] = [];
  @Input() activeFilter: TaskStatus | null = null;

  constructor(
    private projectsService: ProjectsService, 
    private router: Router,
    private taskService: TaskService,
    private dialogService: DialogService
  ) {}

  onEditTask(task: Task) {
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

  ngOnInit() {
    this.projects = this.projectsService.getProjects();
  }
}