import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { TasksComponent } from './tasks/tasks.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: DashboardComponent },

    { path: 'projects', component: ProjectsComponent },
    { path: 'tasks', component: TasksComponent },

    { path: 'create-project', component: ProjectCreateComponent },
    { path: 'create-task', component: TaskCreateComponent },

    { path: 'projects/edit/:id', component: ProjectCreateComponent },
    { path: 'tasks/edit/:id', component: TaskCreateComponent },

    { path: '**', component: NotFoundComponent }
];
