import { Schema } from "mongoose";

export interface ModelIds {
  _id: Schema.Types.ObjectId;
  id: number
}

export interface IOptions {
  params: any;
  path: string
}