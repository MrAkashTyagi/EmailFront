export type StayLocationType =
  | 'HOME'
  | 'RENTED_HOUSE'
  | 'DHARAMSHALA'
  | 'HOTEL'
  | 'OTHER';

export interface StayLocation {

  id?: number;

  name: string;

  type: StayLocationType;

  address?: string | null;

  contactPerson?: string | null;

  contactNumber?: string | null;

  notes?: string | null;

  active: boolean;
}

export interface StayLocationRequest {

  name: string;

  type: StayLocationType;

  address?: string | null;

  contactPerson?: string | null;

  contactNumber?: string | null;

  notes?: string | null;

  active: boolean;
}
