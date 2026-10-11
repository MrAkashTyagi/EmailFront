export type StayAllocationStatus =
  | 'PLANNED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface StayAllocation {

  id: number;

  guestId: number;

  guestName: string;

  familyId?: number | null;

  familyName?: string | null;

  roomId: number;

  roomName: string;

  roomCapacity: number;

  locationId: number;

  locationName: string;

  locationType: string;

  status: StayAllocationStatus;

  checkInDate?: string | null;

  checkOutDate?: string | null;

  notes?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

export interface StayAllocationRequest {

  guestId: number;

  roomId: number;

  checkInDate?: string | null;

  checkOutDate?: string | null;

  notes?: string | null;
}

export interface BulkStayAllocationRequest {

  guestIds: number[];

  roomId: number;

  checkInDate?: string | null;

  checkOutDate?: string | null;

  notes?: string | null;
}

export interface StayRoomCapacity {

  roomId: number;

  roomName: string;

  locationId: number;

  locationName: string;

  capacity: number;

  occupiedBeds: number;

  availableBeds: number;

  full: boolean;
}
