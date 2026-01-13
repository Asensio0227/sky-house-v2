import { UIEstateDocument } from '../estate/types';

export interface UIReviewDocument {
  _id?: string | any;
  id?: string | any;
  rating: number;
  title: string;
  comment: string;
  user: any | unknown;
  estate: UIEstateDocument | any | unknown;
  createdAt: Date | any;
  updatedAT?: Date | any;
}
