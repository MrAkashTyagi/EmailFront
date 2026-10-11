export interface StayRoom {

  id?: number;

  name: string;

  capacity: number;

  floor?: string | null;

  notes?: string | null;

  active: boolean;

  locationId: number;

  locationName: string;

  locationType: string;

  occupiedBeds?: number;

  availableBeds?: number;

  full?: boolean;
}

export interface StayRoomRequest {

  locationId: number;

  name: string;

  capacity: number;

  floor?: string | null;

  notes?: string | null;

  active: boolean;
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
