export interface ISoftDeleteEntity {
  softDelete: ISoftDelete | null;
}

export interface ISoftDelete {
  isDeleted: boolean;
  deletedAt: Date;
  deletedBy: string;
}
