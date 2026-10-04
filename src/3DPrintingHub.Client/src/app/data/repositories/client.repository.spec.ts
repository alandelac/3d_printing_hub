import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '../../core/http/api-client';
import { Client, ClientContactPlatform } from '../../domain/models/client.model';
import { ClientRepository } from './client.repository';

describe('ClientRepository', () => {
  let repository: ClientRepository;
  let httpMock: HttpTestingController;

  const clients: Client[] = [
    {
      id: 'client-1',
      name: 'Ada Lovelace',
      contactPlatform: ClientContactPlatform.WhatsApp,
      phone: '+34 111 222 333',
      email: 'ada@example.com'
    },
    {
      id: 'client-2',
      name: 'Grace Hopper',
      contactPlatform: ClientContactPlatform.Facebook,
      phone: '+34 444 555 666',
      email: 'grace@example.com'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiClient, ClientRepository]
    });

    repository = TestBed.inject(ClientRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests all clients through the shared API client', () => {
    repository.getClients().subscribe(response => {
      expect(response).toEqual(clients);
    });

    const req = httpMock.expectOne('http://localhost:5033/api/clients');
    expect(req.request.method).toBe('GET');
    req.flush(clients);
  });

  it('requests a single client by id', () => {
    repository.getClient('client-1').subscribe(client => {
      expect(client).toEqual(clients[0]);
    });

    const req = httpMock.expectOne('http://localhost:5033/api/clients/client-1');
    expect(req.request.method).toBe('GET');
    req.flush(clients[0]);
  });

  it('creates a client with the backend contract', () => {
    const createPayload = {
      name: 'Alan Turing',
      contactPlatform: ClientContactPlatform.PhoneCall,
      phone: '+34 777 888 999',
      email: 'alan@example.com'
    };

    repository.createClient(createPayload).subscribe(response => {
      expect(response).toEqual({ id: 'new-client' });
    });

    const req = httpMock.expectOne('http://localhost:5033/api/clients');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createPayload);
    req.flush({ id: 'new-client' });
  });

  it('updates a client while including the id in the payload', () => {
    const updatePayload = {
      id: 'client-1',
      name: 'Ada Byron',
      contactPlatform: ClientContactPlatform.WhatsApp,
      phone: '+34 111 999 333',
      email: 'ada.byron@example.com'
    };

    repository.updateClient(updatePayload).subscribe(response => {
      expect(response).toEqual(updatePayload);
    });

    const req = httpMock.expectOne('http://localhost:5033/api/clients/client-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush(updatePayload);
  });
});
