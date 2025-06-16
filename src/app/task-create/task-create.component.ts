import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ProjectsService } from '../services/projects.service';
import { Project } from '../projects/Models/project.model';
import { Task } from '../tasks/Models/task.model';
import { TaskStatus } from '../tasks/Models/task-status.enum';
import { TaskService } from '../services/task.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule, MatChipInputEvent, MatChipGrid } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSelectModule
  ],
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.scss'
})
export class TaskCreateComponent implements OnInit {
  taskForm!: FormGroup;
  projects: Project[] = [];
  @ViewChild('chipList') chipList!: MatChipGrid;

  isEditMode = false;
  editingTaskId: string | null = null;

  statuses = Object.keys(TaskStatus) as (keyof typeof TaskStatus)[];

  constructor(
    private fb: FormBuilder, 
    private projectsService: ProjectsService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.taskForm = this.fb.group({ //this.fb.group == FormBuilder, creates the form
      projectId: [null, Validators.required],
      title: ['', Validators.required],
      dueDate: [null, Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      tags: this.fb.array([]),
      description: ['']
    });

    // Load available projects for the dropdown
    this.projectsService.projects$.subscribe(projects => {
      this.projects = projects;
    });

    // Get the task ID from route parameters
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingTaskId = id;

      // Fetch task details
      this.taskService.getTask(this.editingTaskId).subscribe(task => {
        if (task) {
          this.taskForm.patchValue({
            projectId: task.projectId,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            description: task.description
          });

          this.tags.clear();
          if (task.tags) {
            task.tags.forEach(tag => this.tags.push(new FormControl(tag)));
          }
        } else {
          console.warn(`Task with ID ${id} not found.`);
          this.router.navigate(['/tasks']); // navigate away if task not found
        }
      });
    }
  }

  setDueDate(date: Date) {
    this.taskForm.get('dueDate')?.setValue(date);
  }

  setDueDateToday() {
    this.setDueDate(new Date());
  }

  setDueDateTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.setDueDate(tomorrow);
  }

  statusOptions: (keyof typeof TaskStatus)[] = Object.keys(TaskStatus)
      .filter(k => isNaN(Number(k))) as (keyof typeof TaskStatus)[];
  
    formatStatusLabel(statusKey: keyof typeof TaskStatus): string {
      return TaskStatus[statusKey];
    }

  get tags(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  tagInputControl = new FormControl('');

  addTag(event: MatChipInputEvent, input: HTMLInputElement): void {
    const value = event.value.trim();

    if (value) {
      this.tags.push(new FormControl(value));
    }

    input.value = '';
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  hasError(controlName: string, error: string) {
    const control = this.taskForm.get(controlName);
    return control && control.hasError(error) && control.touched;
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;

      const statusMap: { [key: string]: TaskStatus } = {
        'In Review': TaskStatus.InReview,
        'To Do': TaskStatus.Todo,
        'In Progress': TaskStatus.InProgress,
        'Completed': TaskStatus.Completed
      };

      const taskData: Task = {
        id: this.isEditMode && this.editingTaskId
          ? this.editingTaskId
          : (Date.now().toString()),
        title: formValue.title,
        projectId: formValue.projectId,
        dueDate: formValue.dueDate ?? undefined,
        priority: formValue.priority,
        status: TaskStatus[formValue.status as keyof typeof TaskStatus] || TaskStatus.Todo,
        tags: formValue.tags ?? [],
        description: formValue.description ?? '',
        completed: formValue.status === TaskStatus.Completed,
        completion: formValue.status === TaskStatus.Completed ? 100 : 0
      };

      if (this.isEditMode) {
        this.taskService.updateTask(taskData);
      } else {
        this.taskService.createTask(taskData);
      }
    }
    
    this.taskForm.reset();
    this.tags.clear();
    this.router.navigate(['/tasks']);
  }
}