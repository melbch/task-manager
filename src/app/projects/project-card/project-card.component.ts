import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Project } from '../Models/project.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { ProjectsService } from '../../services/projects.service';
import { ProjectDetailModalComponent } from '../project-detail-modal/project-detail-modal.component';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  @Input() project!: Project;

  @Output() editProject = new EventEmitter<Project>();
  @Output() deleteProject = new EventEmitter<Project>();

  constructor(
    private dialog: MatDialog, 
    private taskService: TaskService,
    private projectsService: ProjectsService
  ) {}

  openProjectModal() {
    this.taskService.getTasks().subscribe(allTasks => {
      const tasks = allTasks.filter(task => task.projectId === this.project.id);

      this.dialog.open(ProjectDetailModalComponent, {
        width: '600px',
        data: {
          project: this.project,
          tasks
        }
      });
    });
  }

  showMenu = false;

  editProjectClicked(project: Project) {
    this.editProject.emit(this.project);
  }

  deleteProjectClicked(project: Project) {
    const confirmed = confirm(`Are you sure you want to delete "${project.title}"?`);
    if (confirmed) {
      this.deleteProject.emit(this.project);
    }
  } 
}
