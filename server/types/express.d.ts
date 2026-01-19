declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      displayName: string;
      firstName?: string | null;
      lastName?: string | null;
      dob?: string | null;
      college?: string | null;
      phone?: string | null;
      address1?: string | null;
      address2?: string | null;
      postCode?: string | null;
      city?: string | null;
      country?: string | null;
      emergencyName?: string | null;
      emergencyPhone?: string | null;
      bmc?: string | null;
      medicalInfo?: string | null;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}

export {};
