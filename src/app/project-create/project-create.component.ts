import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Project } from '../projects/Models/project.model';
import { ProjectStatus } from '../projects/Models/project-status.enum';
import { ProjectsService } from '../services/projects.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule, MatChipGrid } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-project-create',
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
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.scss'
})
export class ProjectCreateComponent implements OnInit {
  @ViewChild('chipList') chipList!: MatChipGrid;

  @Input() projectToEdit?: Project;
  @Input() isEditMode = false;
  @Output() formSubmit = new EventEmitter<Project>();
  @Output() cancelEdit = new EventEmitter<void>();
  
  projectForm!: FormGroup;
  tomorrow = new Date(Date.now() + 86400000);
  editingProjectId: string | null = null;

  ProjectStatus = ProjectStatus;

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.projectForm = this.fb.group({ //fb.group creates the form, fb = FormBuilder
      title: ['', Validators.required],
      dueDate: [null, Validators.required],
      priority: ['', Validators.required],
      status: [ProjectStatus.Planning, Validators.required],
      tags: this.fb.array([]),
      description: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const project = this.projectsService.getProjectById(id);
      if (project) {
        this.isEditMode = true;
        this.editingProjectId = id;
        this.projectForm.patchValue(project);
        if (project.tags) {
          project.tags.forEach(tag => this.tags.push(new FormControl(tag)));
        }
      }
    }
  }

  statusOptions: (keyof typeof ProjectStatus)[] = Object.keys(ProjectStatus)
    .filter(k => isNaN(Number(k))) as (keyof typeof ProjectStatus)[];

  formatStatusLabel(status: string): string {
    //insert spaces before capital letter & trim
    return status.replace(/([A-Z])/g, ' $1').trim();
  }

  get tags() {
    return this.projectForm.get('tags') as FormArray;
  }

  tagInputControl = new FormControl('');

  addTag(event: MatChipInputEvent, input: HTMLInputElement): void {
    const value = event.value.trim();

    if (value) {
      this.tags.push(new FormControl(value));
    }

    input.value = '';
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  setDueDate(date: Date) {
    this.projectForm.patchValue({ dueDate: date });
  }

  setDueDateToday() {
    this.setDueDate(new Date());
  }

  hasError(controlName: string, error: string) {
    const control = this.projectForm.get(controlName);
    return control && control.hasError(error) && control.touched;
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;

      const projectData: Project = {
        ...formValue,
        id: this.isEditMode && this.editingProjectId
          ? this.editingProjectId
          : this.projectsService['generateId'](),
        tags: this.tags.controls.map(control => control.value)
      }; 

      if (this.isEditMode) {
        this.projectsService.updateProject(projectData);
      } else {
        this.projectsService.addProject(projectData);
      }

      this.projectForm.reset();
      this.tags.clear();
      this.router.navigate(['/projects']);
    }
  }
}
