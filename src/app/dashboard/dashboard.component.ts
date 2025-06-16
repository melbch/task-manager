import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ApexStroke,
  ApexDataLabels
} from 'ng-apexcharts';
import { ProjectsService } from '../services/projects.service';
import { Project } from '../projects/Models/project.model';
import { TaskService } from '../services/task.service';
import { Task } from '../tasks/Models/task.model';
import { ProjectStatus } from '../projects/Models/project-status.enum';
import { TaskStatus } from '../tasks/Models/task-status.enum';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke?: ApexStroke;
  dataLabels: ApexDataLabels;
  colors: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  projectStats = { 
    total: 0, 
    planning: 0, 
    toDo: 0, 
    inProgress: 0, 
    inReview: 0, 
    completed: 0, 
    paused: 0, 
    cancelled: 0
  };
  taskStats = { 
    total: 0, 
    overdue: 0, 
    completed: 0, 
    todo: 0, 
    planning: 0,
    inProgress: 0, 
    inReview: 0, 
    paused: 0, 
    cancelled: 0 
  };

  private subscription = new Subscription();
  
  constructor(
    private projectsService: ProjectsService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    // Combine project and task streams for synchronized stats calculation
    this.subscription.add(
      combineLatest([this.projectsService.projects$, this.taskService.tasks$]).subscribe(
        ([projects, tasks]) => {
          this.calculateProjectStats(projects);
          this.calculateTaskStats(tasks);
          this.updateProjectCharts();
          this.updateTaskCharts();
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  calculateProjectStats(projects: Project[]) {
    this.projectStats.total = projects.length;
    this.projectStats.planning = projects.filter(p => p.status === ProjectStatus.Planning).length;
    this.projectStats.toDo = projects.filter(p => p.status === ProjectStatus.ToDo).length;
    this.projectStats.inProgress = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    this.projectStats.inReview = projects.filter(p => p.status === ProjectStatus.InReview).length;
    this.projectStats.completed = projects.filter(p => p.status === ProjectStatus.Completed).length;
    this.projectStats.paused = projects.filter(p => p.status === ProjectStatus.Paused).length;
    this.projectStats.cancelled = projects.filter(p => p.status === ProjectStatus.Cancelled).length;
  }

  calculateTaskStats(tasks: Task[]) {
    const now = new Date();

    this.taskStats.total = tasks.length;
    this.taskStats.completed = tasks.filter(t => t.status === TaskStatus.Completed).length;
    this.taskStats.overdue = tasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate) < now).length;

    this.taskStats.todo = tasks.filter(t => t.status === TaskStatus.Todo).length;
    this.taskStats.planning = tasks.filter(t => t.status === TaskStatus.Planning).length;
    this.taskStats.inProgress = tasks.filter(t => t.status === TaskStatus.InProgress).length;
    this.taskStats.inReview = tasks.filter(t => t.status === TaskStatus.InReview).length;
    this.taskStats.paused = tasks.filter(t => t.status === TaskStatus.Paused).length;
    this.taskStats.cancelled = tasks.filter(t => t.status === TaskStatus.Cancelled).length;
  }

  updateProjectCharts() {
    this.projectRadialChart.series = [
    this.projectStats.total > 0
        ? Math.round((this.projectStats.completed / this.projectStats.total) * 100)
        : 0
    ];

    this.projectDonutChart.series = [
      this.projectStats.planning,
      this.projectStats.toDo,
      this.projectStats.inProgress,
      this.projectStats.inReview,
      this.projectStats.completed,
      this.projectStats.paused,
      this.projectStats.cancelled
    ];
  }

  updateTaskCharts() {
    this.taskRadialChart.series = [
      this.taskStats.total > 0
        ? Math.round((this.taskStats.completed / this.taskStats.total) * 100)
        : 0
    ];
      this.taskDonutChart.series = [
      this.taskStats.completed,
      this.taskStats.inProgress,
      this.taskStats.todo + this.taskStats.planning,
      this.taskStats.paused,
      this.taskStats.cancelled,
      this.taskStats.overdue,
      this.taskStats.inReview
    ];
  }

  //chart for complete % of projects
  projectRadialChart: ChartOptions = {
    series: [
      this.projectStats.total > 0
      ? Math.round((this.projectStats.completed / this.projectStats.total) * 100)
      : 0
    ],
    chart: { height: 250, type: 'radialBar', },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '60%' },
        dataLabels: {
          name: { show: false },
          value: { fontSize: '20px', color: '#111', offsetY: 5, }
        }
      }
    },
    dataLabels: { enabled: true },
    fill: { colors: ['#00E396'] },
    colors: ['#00E396', '#FEB019'],
    labels: ['Completed'],
  };

  //donut chart for project status breakdown
  projectDonutChart: ChartOptions = {
    series: [],
    chart: { type: 'donut', height: 250 },
    labels: ['Completed', 'Paused', 'Cancelled', 'In Review', 'Planning', 'In Progress', 'To Do'],
    colors: ['#FFC107', '#28A745', '#FD7E14', '#DC3545', '#17A2B8', '#6F42C1', '#E83E8C'],
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: '60%' } } },
    fill: { type: 'solid' }
  };

  //chart for completed % of tasks
  taskRadialChart: ChartOptions = {
    series: [
      this.taskStats.total > 0
        ? Math.round((this.taskStats.completed / this.taskStats.total) * 100)
        : 0
    ],
    chart: { height: 250, type: 'radialBar' },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '60%' },
        dataLabels: {
          name: { show: false },
          value: { fontSize: '20px', color: '#111', offsetY: 5 }
        }
      }
    },
    dataLabels: { enabled: true },
    fill: { colors: ['#00E396'] },
    colors: ['#00E396', '#FEB019'],
    labels: ['Completed']
  };

  //donut chart for tasks status breakdown
  taskDonutChart: ChartOptions = {
    series: [
      this.taskStats.completed,
      this.taskStats.inProgress,
      this.taskStats.todo,
      this.taskStats.paused,
      this.taskStats.cancelled,
      this.taskStats.overdue
    ],
    chart: { type: 'donut',height: 250, },
    labels: ['Completed', 'In Progress', 'To Do', 'Paused', 'Cancelled', 'Overdue', 'In Review'],
    colors: ['#FFC107', '#28A745', '#FD7E14', '#DC3545', '#17A2B8', '#6F42C1', '#E83E8C'],
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: '60%' } } },
    fill: { type: 'solid' }
  };
}
