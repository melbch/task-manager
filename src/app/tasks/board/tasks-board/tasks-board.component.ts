import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../../Models/task.model';
import { Project } from '../../../projects/Models/project.model';
import { ProjectsService } from '../../../services/projects.service';
import { TaskStatus } from '../../Models/task-status.enum';
import { TaskBoardColumnComponent } from '../task-board-column/task-board-column.component';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [CommonModule, TaskBoardColumnComponent],
  templateUrl: './tasks-board.component.html',
  styleUrl: './tasks-board.component.scss'
})
export class TasksBoardComponent implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() projects: Project[] = [];
  @Input() visibleStatuses: TaskStatus[] = [];

  constructor(private projectsService: ProjectsService, private router: Router) {}

  onEditTask(task: Task) {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  ngOnInit() {
    this.projects = this.projectsService.getProjects();
  }

  filteredTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }
}