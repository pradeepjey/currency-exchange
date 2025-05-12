import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { jasmineExpect } from '../../test-helpers';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no more pending requests
    httpMock.verify();
  });

  it('should be created', () => {
    jasmineExpect(service).toBeTruthy();
  });

  // GET request with parameters
  it('should make a GET request with correct URL and parameters', () => {
    // Define test data
    const mockResponse = { id: 1, name: 'Test Data' };
    const endpoint = 'users';
    const params = { page: 1, limit: 10 };

    // Make the API call
    service.get<any>(endpoint, params).subscribe(response => {
      jasmineExpect(response).toEqual(mockResponse);
    });

    // Verify the request was made with correct URL and parameters
    const req = httpMock.expectOne(request => {
      return (
        request.url === `${baseUrl}/${endpoint}` &&
        request.method === 'GET' &&
        request.params.get('page') === '1' &&
        request.params.get('limit') === '10'
      );
    });

    // Check that null/undefined params are not included
    jasmineExpect(req.request.params.has('undefined')).toBeFalse();
    
    // Return mock response
    req.flush(mockResponse);
  });

  // POST request with body
  it('should make a POST request with correct URL and body', () => {
    // Define test data
    const mockResponse = { id: 1, success: true };
    const endpoint = 'users/create';
    const postData = { name: 'John Doe', email: 'john@example.com' };

    // Make the API call
    service.post<any>(endpoint, postData).subscribe(response => {
      jasmineExpect(response).toEqual(mockResponse);
    });

    // Verify the request
    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    jasmineExpect(req.request.method).toBe('POST');
    jasmineExpect(req.request.body).toEqual(postData);

    // Return mock response
    req.flush(mockResponse);
  });

  // Error handling
  it('should handle HTTP errors correctly', () => {
    // Define test data
    const endpoint = 'invalid/endpoint';
    const errorStatusCode = 404;
    const errorStatusText = 'Not Found';
    const errorMessage = 'Resource not found';

    // Prepare to catch errors
    let actualError: Error | undefined;

    // Make the API call that will error
    service.get<any>(endpoint).subscribe({
      next: () => fail('Should have failed with 404 error'),
      error: (error: Error) => {
        actualError = error;
      }
    });

    // Simulate a server error response
    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    req.flush(
      { message: errorMessage },
      { status: errorStatusCode, statusText: errorStatusText }
    );

    // Verify error handling
    jasmineExpect(actualError).toBeDefined();
    jasmineExpect(actualError?.message).toContain('Error Code: 404');
    jasmineExpect(actualError?.message).toContain(errorStatusText);
  });

  // DELETE request
  it('should make a DELETE request with correct URL', () => {
    // Define test data
    const mockResponse = { success: true };
    const endpoint = 'users/1';

    // Make the API call
    service.delete<any>(endpoint).subscribe(response => {
      jasmineExpect(response).toEqual(mockResponse);
    });

    // Verify the request
    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    jasmineExpect(req.request.method).toBe('DELETE');

    // Return mock response
    req.flush(mockResponse);
  });

  // PUT request
  it('should make a PUT request with correct URL and body', () => {
    // Define test data
    const mockResponse = { id: 1, updated: true };
    const endpoint = 'users/1';
    const putData = { name: 'Updated Name', email: 'updated@example.com' };

    // Make the API call
    service.put<any>(endpoint, putData).subscribe(response => {
      jasmineExpect(response).toEqual(mockResponse);
    });

    // Verify the request
    const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
    jasmineExpect(req.request.method).toBe('PUT');
    jasmineExpect(req.request.body).toEqual(putData);

    // Return mock response
    req.flush(mockResponse);
  });
});