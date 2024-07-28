import { EventTypesEnum } from "../constants";

export interface IOptions {
  params: any;
  path: string;
}

export const enum EventTypesStatusEnum {
  'PENDING' = 'PENDING',
  'SUCCESS' = 'SUCCESS',
  'FAILED' = 'FAILED',
}

export interface ILikelyType {
  fixtureId: number;
  status: EventTypesStatusEnum;
  type: EventTypesEnum;
  name: string;
  value: string | number;
}