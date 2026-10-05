export enum ClientContactPlatform {
  WhatsApp = 'WhatsApp',
  Facebook = 'Facebook',
  PhoneCall = 'PhoneCall'
}

export interface Client {
  id: string;
  name: string;
  contactPlatform: ClientContactPlatform;
  isArchived?: boolean;
  phone?: string | null;
  email?: string | null;
}

export type ClientCreate = {
  name: string;
  contactPlatform: ClientContactPlatform;
  phone?: string | null;
  email?: string | null;
};

export type ClientUpdate = Client;
