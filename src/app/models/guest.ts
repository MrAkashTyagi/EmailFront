export interface Family {

  id?: number;

  familyName?: string;
}

export interface Guest {

  id?: number;

  name: string;

  email?: string;

  phoneNumber?: string;

  whatsapp_Number?: string;

  guestCategory?: string;

  gender?: string;

  adultOrchild?: string;

  gift?: string;

  cash?: string;

  stay?: string;

  invitationSent?: boolean;

  family?: Family | null;
}
