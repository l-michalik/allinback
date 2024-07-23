import { Schema } from "mongoose";

export interface ModelIds {
  _id: Schema.Types.ObjectId;
  id: number
}

export interface IOptions {
  params: any;
  path: string
}

export interface IGoals {
  '0.5': number;
  '1.5': number;
  '2.5': number;
  '3.5': number;
  '4.5': number;
  '5.5': number;
}

export interface IHandicap {
  '-3': number;
  '-2': number;
  '-1': number;
  '+1': number;
  '+2': number;
  '+3': number;
}

export interface IBet {
  'Wynik meczu (z wyłączeniem dogrywki)': {
    'home': number;
    'draw': number;
    'away': number;
  },
  'Podwójna szansa': {
    '1X': number;
    '12': number;
    'X2': number;
  },
  'Gole Powyżej/Poniżej': {
    'Powyżej': IGoals,
    'Poniżej': IGoals
  },
  'Oba zespoły strzelą gola': {
    'Tak': number;
    'Nie': number;
  },
  'Gole gospodarzy powyżej/poniżej': {
    'Powyżej': IGoals,
    'Poniżej': IGoals
  },
  'Gole gości powyżej/poniżej': {
    'Powyżej': IGoals,
    'Poniżej': IGoals
  },
  'Handicap': {
    'home': IHandicap,
    'away': IHandicap
  },
  'Pierwszy gol': {
    'home': number;
    'without': number;
    'away': number;
  },
  'Wynik 1. połowy': {
    'home': number;
    'draw': number;
    'away': number;
  },
  '1. połowa, gole powyżej/poniżej': {
    'Powyżej': IGoals,
    'Poniżej': IGoals
  }
}