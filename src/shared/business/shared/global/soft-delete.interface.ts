export interface ISoftDeleteEntity {
  softDelete: ISoftDelete | null;
}

export interface ISoftDelete {
  isDeleted: boolean;
  deletedAt: Date;
  deletedByUserId: string;
  deletedByEmployeeId: string | null;
}
