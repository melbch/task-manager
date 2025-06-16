import { Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../projects/Models/project.model';
import { ProjectStatus } from '../projects/Models/project-status.enum';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private _projects: Project[] = [];
  private readonly STORAGE_KEY = 'projects';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  //BehaviorSubject to hold current projects and emit updates
  private projectsSubject = new BehaviorSubject<Project[]>(this.loadProjects());
  projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  constructor() {
    //initialize local cache when service is created
    this._projects = this.projectsSubject.value;
  }

  //Load projects from LocalStorage or fallback to default sample projects
  private loadProjects(): Project[] {
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // convert string dates back to date objects
          return parsed.map((p: any) => ({
            ...p,
            dueDate: new Date(p.dueDate)
          }));
        } catch {
          //if error fallback to default
          return this.getDefaultProjects();
        }
      }
    }

    return this.getDefaultProjects();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private saveProjects(projects: Project[]) {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    }
  }

  private getDefaultProjects(): Project[] {
    return [
      {
        id: '1',
        title: 'Project Alpha',
        dueDate: new Date('2025-07-01'),
        tags: ['Urgent', 'Frontend'],
        priority: 'High',
        status: ProjectStatus.InReview
      },
      {
        id: '2',
        title: 'Project Beta',
        dueDate: new Date('2025-08-15'),
        tags: ['Backend'],
        priority: 'Medium',
        status: ProjectStatus.ToDo
      },
      { 
        id: '3', 
        title: 'Project Delta', 
        dueDate: new Date('2025-08-15'), 
        tags: ['Backend'],
        priority: 'Low', 
        status: ProjectStatus.Planning
      },
      { 
        id: '4', 
        title: 'Project Omega', 
        dueDate: new Date('2025-08-15'), 
        tags: ['Backend'], 
        priority: 'Low',
        status: ProjectStatus.Paused
      },
      { 
        id: '5', 
        title: "Self-Improvement", 
        dueDate: new Date('2030-12-31'), 
        tags: ['Improvement'], 
        priority: 'Low',
        status: ProjectStatus.InProgress,
        canDelete: false
      },
    ];
  }

  getProjects(): Project[] {
    return this.projectsSubject.value;
  }

  //get project synchronously from local cache by ID
  getProjectById(id: string): Project | undefined {
    return this._projects.find(p => p.id === id);
  }

  addProject(project: Project): void {
    if (this.projectsSubject.value.some(p => p.id === project.id)) {
      console.warn(`Project with ID ${project.id} already exists.`);
      return;
    }
    
    const updated = [...this.projectsSubject.value, project];
    this.projectsSubject.next(updated);
    this.saveProjects(updated);
    this._projects = updated;
  }

  updateProject(project: Project): void {
    const updated = this.projectsSubject.value.map(p => 
      p.id === project.id ? project : p
    );
    this.projectsSubject.next(updated);
    this.saveProjects(updated);
    this._projects = updated;
  }

  deleteProject(projectId: string): void {
    const current = this.projectsSubject.value;
    const project = current.find(p => p.id === projectId);

    //prevent deleting if canDelete is false
    if (project?.canDelete === false) {
      console.warn(`You don't have authorization to delete ${project.title}`);
      return
    }

    const updated = current.filter(p => p.id !== projectId);
    this.projectsSubject.next(updated);
    this.saveProjects(updated);
    this._projects = updated;
  }
}