import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TaskService } from './task.service';

fdescribe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,  //service that's being tested
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController)
  });

  //after each, verify that no outstanding HTTP request remain
  afterEach(() => {
    httpMock.verify(); //throws error if HTTP cslls were not flushed/matched
  })

  it('should be created', () => {
    expect(service).toBeTruthy();

    //HTTP get request to load initial tasks,
    //respond with an empty todos array
    const req = httpMock.expectOne('https://dummyjson.com/todos');
    req.flush({ todos: [] }); // simulate server response
  });

  it('should load initial tasks on creation', (done) => {
    //prepare mock response
    const mockResponse = {
      todos: [
        {
          id: 1,
          todo: 'Mock Task',
          completed: false
        }
      ]
    };

    const req = httpMock.expectOne('https://dummyjson.com/todos');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse); //respond with mock data
    
    service.getTasks().subscribe(tasks => {
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toBe('Mock Task'); //check taht first task title matches the mock todo
      done();
    });
  });
});