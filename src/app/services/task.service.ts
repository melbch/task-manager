import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../tasks/Models/task.model';
import { TaskStatus } from '../tasks/Models/task-status.enum';
import { ProjectsService } from './projects.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://dummyjson.com/todos';
  private _tasks = signal<Task[]>([]);
  public readonly tasks = this._tasks.asReadonly();
  private readonly STORAGE_KEY = 'tasks';
  private isBrowser = typeof window !== 'undefined';
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private localTasks: Task[] = [];
  private lastId = 1000; //to generate new IDs locally

  constructor(private http: HttpClient) {
    this.localTasks = this.loadTasksFromLocalStorage();
    this.loadInitialTasks();

    effect(() => 
    this.tasksSubject.next(this._tasks()));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      return of(result as T); //return as safe fallback value
    }
  }

  private normalizePriority(priority: any): 'low' | 'medium' | 'high' | undefined {
    if (!priority || typeof priority !== 'string') return undefined;
    const p = priority.toLowerCase();
    if (p === 'low' || p === 'medium' || p === 'high') {
      return p;
    }
    return undefined;
  }

  private saveTasksToLocalStorage() {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.localTasks));
    }
  }

  private loadInitialTasks() {
    this.http.get<{ todos: any[] }>(this.apiUrl).pipe(
      map(response => {
        const projects = ['1', '2', '3', '4', '5']; // ideally from ProjectsService

        const statuses = [
          TaskStatus.Planning,
          TaskStatus.Todo,
          TaskStatus.InProgress,
          TaskStatus.InReview,
          TaskStatus.Completed,
          TaskStatus.Paused,
          TaskStatus.Cancelled
        ];

        return response.todos.slice(0, 10).map((t, index) => ({
          id: t.id.toString(),
          title: t.todo,
          completed: t.completed,
          status: statuses[index % statuses.length],  // Assign status in round-robin
          projectId: projects[index % projects.length], // assign project round-robin
          priority: 'low',
          dueDate: null,
          tags: [],
          description: '',
          completion: t.completed ? 100 : 0,
          userId: t.userId
        }));
      }),
      tap(apiTasks => {
        const mappedTasks = apiTasks.map(t => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          priority: this.normalizePriority(t.priority)
        }));

        console.log('API tasks loaded & mapped:', mappedTasks.length);
        const allTasks = [...mappedTasks, ...this.localTasks];
        this._tasks.set(allTasks);
        this.tasksSubject.next(allTasks);
        console.log('All tasks after merge:', this._tasks());
      }),
      catchError(this.handleError('loadInitialTasks', []))
    ).subscribe();
  }

  //load tasks from API + local, merge & emit
  loadTasks(): void {
    this.http.get<{ todos: Task[] }>(this.apiUrl).pipe(
      map(response => response.todos),
      tap(apiTasks => {
        //Merge API tasks with local tasks, unique id
        const allTasks = [...apiTasks, ...this.localTasks];
        this.tasksSubject.next(allTasks);
      }),
      catchError(this.handleError('loadTasks', []))
    ).subscribe();
  }

  private loadTasksFromLocalStorage(): Task[] {
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((t: any) => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate) : null
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  //get tasks as observable (already combined)
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  //get single tasks by id from current tasks
  getTask(id: string): Observable<Task | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(t => t.id === id.toString()))
    );
  }

  getTasksForProject(projectId: string): Task[] {
    return this._tasks().filter(t => t.projectId === projectId);
  }

  //create new task locally
  createTask(task: Partial<Task>): void {
    console.log('Creating task with input status:', task.status);
    //normalize status
    let statusValue: TaskStatus = TaskStatus.Todo;

    if (typeof task.status === 'string') {
      //try to convert string key to enum value
      const mapped = TaskStatus[task.status as keyof typeof TaskStatus];
      if (mapped) {
        statusValue = mapped;
        console.log('Mapped status string to enum value:', statusValue);
      } else {
        //if no mapping found, try to check if string matches enum value directly
        const foundValue = Object.values(TaskStatus).find(v => v === task.status);
        if (foundValue) {
          statusValue = foundValue;
          console.log('Used matching enum value:', statusValue);
        }
      }
    } else if (task.status) {
      //if already a TaskStatus enum value, just use it
      statusValue = task.status;
      console.log('Using enum status value directly:', statusValue);
    }

    const newTask: Task = {
      id: `local-${++this.lastId}`,
      title: task.title || 'New Task',
      projectId: task.projectId || 'default-project-id',
      dueDate: task.dueDate ?? undefined,
      priority: task.priority || 'low',
      status: statusValue,
      tags: task.tags || [],
      description: task.description || '',
      completed: false,
      completion: 0
    };

    this.localTasks.push(newTask);
    const currentTasks = this._tasks();
    this._tasks.set([...currentTasks, newTask]);
    this.saveTasksToLocalStorage();
  }

  //update task locally by id
  updateTask(updatedTask: Task): void {
    //update local tasks
    const localIndex = this.localTasks.findIndex(t => t.id === updatedTask.id);
    if (localIndex !== -1) {
      this.localTasks[localIndex] = updatedTask;
    } else if (updatedTask.id.startsWith('local-')) {
      this.localTasks.push(updatedTask);
    }

    // Update the signal state
    const updatedTasks = this._tasks().map(t =>
      t.id === updatedTask.id ? updatedTask : t
    );
    
    this._tasks.set(updatedTasks);

    // Sync local tasks and persist
    this.localTasks = updatedTasks.filter(t => t.id.startsWith('local-'));
    this.saveTasksToLocalStorage();
  }

  deleteTask(taskId: string): void {
    this.localTasks = this.localTasks.filter(t => t.id !== taskId);
    const filtered = this._tasks().filter(t => t.id !== taskId);
    this._tasks.set(filtered);
    this.saveTasksToLocalStorage();
  }
}