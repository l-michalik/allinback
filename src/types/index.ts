import { EventTypesEnum } from "../constants";

export interface IOptions {
  params: any;
  path: string;
}

export const enum EventStatusEnum {
  'PENDING' = 'PENDING',
  'SUCCESS' = 'SUCCESS',
  'FAILED' = 'FAILED',
}

export interface ILikelyType {
  fixtureId: number;
  status: EventStatusEnum;
  type: EventTypesEnum;
  name: string;
  value: string | number;
}