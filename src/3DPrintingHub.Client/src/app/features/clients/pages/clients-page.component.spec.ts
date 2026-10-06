import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClientRepository } from '../../../data/repositories/client.repository';
import { Client, ClientContactPlatform } from '../../../domain/models/client.model';
import { ClientsPageComponent } from './clients-page.component';

describe('ClientsPageComponent', () => {
  const clients: Client[] = [
    {
      id: '1',
      name: 'Ada Lovelace',
      contactPlatform: ClientContactPlatform.WhatsApp,
      phone: '+34 111 222 333',
      email: 'ada@example.com'
    },
    {
      id: '2',
      name: 'Grace Hopper',
      contactPlatform: ClientContactPlatform.Facebook,
      phone: '+34 444 555 666',
      email: 'grace@example.com'
    }
  ];

  let fixture: ComponentFixture<ClientsPageComponent>;
  let getClients: ReturnType<typeof vi.fn>;
  let createClient: ReturnType<typeof vi.fn>;
  let updateClient: ReturnType<typeof vi.fn>;
  let archiveClient: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const addButton = (): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll('button')).find(button => button.textContent?.includes('Add Client')) as HTMLButtonElement | undefined;

  const formButtons = (): HTMLButtonElement[] =>
    Array.from(compiled().querySelector('app-client-form-modal')?.querySelectorAll('button') ?? []);

  const modalInputs = (): HTMLInputElement[] =>
    Array.from(compiled().querySelector('app-client-form-modal')?.querySelectorAll('input') ?? []);

  const findButtonByText = (text: string): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll('button')).find(button => button.textContent?.trim() === text);

  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    getClients = vi.fn().mockReturnValue(of(clients));
    createClient = vi.fn().mockReturnValue(of({ id: '3' }));
    updateClient = vi.fn().mockReturnValue(of(clients[0]));
    archiveClient = vi.fn().mockReturnValue(of(undefined));
    vi.stubGlobal('alert', vi.fn());

    await TestBed.configureTestingModule({
      imports: [ClientsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ClientRepository, useValue: { getClients, createClient, updateClient, archiveClient } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the clients and renders them through the shared table', async () => {
    fixture.detectChanges();
    await flush();

    const headers = Array.from(compiled().querySelectorAll('thead th')).map(header => header.textContent?.trim());
    const rows = Array.from(compiled().querySelectorAll('tbody tr')).map(row => row.textContent?.trim());

    expect(getClients).toHaveBeenCalledTimes(1);
    expect(compiled().querySelector('app-table table')).not.toBeNull();
    expect(headers).toEqual(['Name', 'Contact Platform', 'Phone', 'Email', 'Actions']);
    expect(rows[0]).toContain('Ada Lovelace');
    expect(rows[0]).toContain('WhatsApp');
  });

  it('falls back to an empty list when the API returns no rows', async () => {
    getClients.mockReturnValue(of([]));

    fixture.detectChanges();
    await flush();

    expect(compiled().textContent).toContain('No clients found.');
  });

  it('reports a failed load without rendering rows', async () => {
    getClients.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    await flush();

    expect(alert).toHaveBeenCalled();
    expect(compiled().textContent).toContain('No clients found.');
  });

  it('creates a client from the add client modal', async () => {
    fixture.detectChanges();
    await flush();

    addButton()?.click();
    await flush();

    const [nameInput, phoneInput, emailInput] = modalInputs();

    nameInput.value = 'Alan Turing';
    nameInput.dispatchEvent(new Event('input'));
    phoneInput.value = '+34 777 888 999';
    phoneInput.dispatchEvent(new Event('input'));
    emailInput.value = 'alan@example.com';
    emailInput.dispatchEvent(new Event('input'));

    formButtons().find(button => button.textContent?.includes('Save Client'))?.click();
    await flush();

    expect(createClient).toHaveBeenCalledWith({
      name: 'Alan Turing',
      contactPlatform: ClientContactPlatform.WhatsApp,
      phone: '+34 777 888 999',
      email: 'alan@example.com'
    });
  });

  it('opens an edit modal and saves changes', async () => {
    fixture.detectChanges();
    await flush();

    const editButton = Array.from(compiled().querySelectorAll('button')).find(button => button.textContent === 'Edit');
    editButton?.click();
    await flush();

    const nameInput = modalInputs()[0] as HTMLInputElement;
    nameInput.value = 'Ada Byron';
    nameInput.dispatchEvent(new Event('input'));

    formButtons().find(button => button.textContent?.includes('Save Client'))?.click();
    await flush();

    expect(updateClient).toHaveBeenCalledWith({
      id: '1',
      name: 'Ada Byron',
      contactPlatform: ClientContactPlatform.WhatsApp,
      phone: '+34 111 222 333',
      email: 'ada@example.com'
    });
  });

  it('does not save when the required name is empty', async () => {
    fixture.detectChanges();
    await flush();

    addButton()?.click();
    await flush();

    const nameInput = modalInputs()[0] as HTMLInputElement;
    nameInput.value = '';
    nameInput.dispatchEvent(new Event('input'));

    formButtons().find(button => button.textContent?.includes('Save Client'))?.click();
    await flush();

    expect(createClient).not.toHaveBeenCalled();
    expect(compiled().textContent).toContain('Name is required');
  });

  it('archives a client after confirmation and removes it from the active list', async () => {
    fixture.detectChanges();
    await flush();

    const archiveButton = findButtonByText('Archive');
    expect(archiveButton).toBeDefined();
    archiveButton?.click();
    await flush();

    expect(document.body.textContent).toContain('History will be retained');

    const confirmArchiveButton = Array.from(compiled().querySelectorAll('button')).find(button => button.textContent?.trim() === 'Yes, Archive');
    confirmArchiveButton?.click();
    await flush();

    expect(archiveClient).toHaveBeenCalledWith('1');
    expect(compiled().querySelector('app-confirm-delete')).toBeNull();
  });

  it('cancels the archive confirmation without requesting the API', async () => {
    fixture.detectChanges();
    await flush();

    findButtonByText('Archive')?.click();
    await flush();

    const cancelButton = Array.from(compiled().querySelectorAll('button')).find(button => button.textContent?.trim() === 'Cancel');
    cancelButton?.click();
    await flush();

    expect(archiveClient).not.toHaveBeenCalled();
    expect(compiled().querySelector('app-confirm-delete')).toBeNull();
  });
});
