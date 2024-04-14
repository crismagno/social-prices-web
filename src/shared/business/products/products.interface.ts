export interface IProduct {
  readonly _id: string;
  name: string;
  quantity: number;
  description: string | null;
  details: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  storeIds: string[];
  filesUrl: string[];
  mainUrl: string | null;
  barCode: string | null;
  QRCode: string | null;
}
