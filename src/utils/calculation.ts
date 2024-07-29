import { EventStatusEnum, ILikelyType } from "../types";
import { EventTypesEnum } from "../constants";
import { getPercentage } from ".";

export function calculateMatchResultPercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  const result: ILikelyType[] = [];

  const calculatePercentageAndPush = (
    condition: (f: any) => boolean,
    team: string
  ) => {
    const percentage = calculatePercentage(analyzedFixtures, condition);
    console.log(`---- ${team} : ${percentage.toFixed(2)}%`);
    if (percentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: percentage,
        type: EventTypesEnum["Wynik meczu (z wyłączeniem dogrywki)"],
        name: team,
      });
    }
  };

  calculatePercentageAndPush(
    (f) => f.statistic.score.fulltime.home > f.statistic.score.fulltime.away,
    homeTeam
  );

  calculatePercentageAndPush(
    (f) => f.statistic.score.fulltime.home === f.statistic.score.fulltime.away,
    "Remis"
  );

  calculatePercentageAndPush(
    (f) => f.statistic.score.fulltime.home < f.statistic.score.fulltime.away,
    awayTeam
  );

  return result;
}

export function calculateDoubleChancePercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  const result: ILikelyType[] = [];

  const calculateAndPush = (condition: (f: any) => boolean, name: string) => {
    const percentage = calculatePercentage(analyzedFixtures, condition);
    console.log(`---- ${name} : ${percentage.toFixed(2)}%`);
    if (percentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: percentage,
        type: EventTypesEnum["Podwójna szansa"],
        name,
      });
    }
  };

  calculateAndPush(
    (f) => f.statistic.score.fulltime.home >= f.statistic.score.fulltime.away,
    `${homeTeam} lub Remis`
  );

  calculateAndPush(
    (f) => f.statistic.score.fulltime.home !== f.statistic.score.fulltime.away,
    `${homeTeam} lub ${awayTeam}`
  );

  calculateAndPush(
    (f) => f.statistic.score.fulltime.home <= f.statistic.score.fulltime.away,
    `${awayTeam} lub Remis`
  );

  return result;
}

export function calculateOverUnderPercentages(
  fixtureId: number,
  analyzedFixtures: any[]
) {
  const result: ILikelyType[] = [];

  const thresholds = [0.5, 1.5, 2.5, 3.5];

  thresholds.forEach((threshold) => {
    const overPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home + f.statistic.score.fulltime.away >
        threshold
    );

    console.log(`---- Powyżej ${threshold}: ${overPercentage.toFixed(2)}%`);

    if (overPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: overPercentage,
        type: EventTypesEnum["Gole Powyżej/Poniżej"],
        name: `Powyżej ${threshold}`,
      });
    }

    const underPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home + f.statistic.score.fulltime.away <
        threshold
    );

    console.log(`---- Poniżej ${threshold}: ${underPercentage.toFixed(2)}%`);

    if (underPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: underPercentage,
        type: EventTypesEnum["Gole Powyżej/Poniżej"],
        name: `Poniżej ${threshold}`,
      });
    }
  });

  return result;
}

export function calculateBTTSPercentages(
  fixtureId: number,
  analyzedFixtures: any[]
) {
  const result: ILikelyType[] = [];

  const calculateAndPush = (condition: (f: any) => boolean, name: string) => {
    const percentage = calculatePercentage(analyzedFixtures, condition);
    console.log(`---- ${name}: ${percentage.toFixed(2)}%`);
    if (percentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: percentage,
        type: EventTypesEnum["Oba zespoły strzelą gola"],
        name,
      });
    }
  };

  calculateAndPush(
    (f) => f.statistic.score.fulltime.home > 0 && f.statistic.score.fulltime.away > 0,
    "Tak"
  );

  calculateAndPush(
    (f) => f.statistic.score.fulltime.home === 0 || f.statistic.score.fulltime.away === 0,
    "Nie"
  );

  return result;
}

export function calculateTeamOverUnderPercentages(
  fixtureId: number,
  eventTypesEnum: EventTypesEnum,
  analyzedFixtures: any[],
  teamId: number
) {
  const result: ILikelyType[] = [];
  const thresholds = [0.5, 1.5, 2.5, 3.5];

  const fixturesForTeam = analyzedFixtures.filter(
    (f) => f.teams.home.id === teamId || f.teams.away.id === teamId
  );

  if (fixturesForTeam.length === 0) {
    console.log(`---- Brak meczów dla drużyny o id ${teamId}`);
    return [];
  }

  thresholds.forEach((threshold) => {
    const overPercentage = calculatePercentage(
      fixturesForTeam,
      (f) =>
        (f.statistic.score.fulltime.home > threshold && f.teams.home.id === teamId) ||
        (f.statistic.score.fulltime.away > threshold && f.teams.away.id === teamId)
    );

    console.log(`---- Powyżej ${threshold}: ${overPercentage.toFixed(2)}%`);

    if (overPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: overPercentage,
        type: eventTypesEnum,
        name: `Powyżej ${threshold}`,
      });
    }

    const underPercentage = calculatePercentage(
      fixturesForTeam,
      (f) =>
        (f.statistic.score.fulltime.home < threshold && f.teams.home.id === teamId) ||
        (f.statistic.score.fulltime.away < threshold && f.teams.away.id === teamId)
    );

    console.log(`---- Poniżej ${threshold}: ${underPercentage.toFixed(2)}%`);

    if (underPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: underPercentage,
        type: eventTypesEnum,
        name: `Poniżej ${threshold}`,
      });
    }
  });

  return result;
}

export function calculateHandicapPercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
): any {
  const result: ILikelyType[] = [];
  const thresholds = [1, 2];

  thresholds.forEach((threshold) => {
    const conditions = [
      (f:any) => f.statistic.score.fulltime.home - threshold > f.statistic.score.fulltime.away,
      (f:any) => f.statistic.score.fulltime.away - threshold > f.statistic.score.fulltime.home,
      (f:any) => f.statistic.score.fulltime.home + threshold > f.statistic.score.fulltime.away,
      (f:any) => f.statistic.score.fulltime.away + threshold > f.statistic.score.fulltime.home
    ];

    const names = [
      `${homeTeam} -${threshold}`,
      `${awayTeam} -${threshold}`,
      `${homeTeam} +${threshold}`,
      `${awayTeam} +${threshold}`
    ];

    conditions.forEach((condition, index) => {
      const percentage = calculatePercentage(analyzedFixtures, condition);
      console.log(`---- ${names[index]}: ${percentage.toFixed(2)}%`);
      if (percentage >= 75) {
        result.push({
          fixtureId,
          status: EventStatusEnum.PENDING,
          probability: percentage,
          type: EventTypesEnum["Handicap"],
          name: names[index],
        });
      }
    });
  });
  
  return result;
}

export function calculateFirstHalfResultPercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  const result: ILikelyType[] = [];

  const calculateAndPush = (condition: (f: any) => boolean, name: string) => {
    const percentage = calculatePercentage(analyzedFixtures, condition);
    console.log(`---- ${name} : ${percentage.toFixed(2)}%`);
    if (percentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: percentage,
        type: EventTypesEnum["Wynik 1. połowy"],
        name,
      });
    }
  };

  calculateAndPush(
    (f) => f.statistic.score.halftime.home > f.statistic.score.halftime.away,
    homeTeam
  );

  calculateAndPush(
    (f) => f.statistic.score.halftime.home === f.statistic.score.halftime.away,
    "Remis"
  );

  calculateAndPush(
    (f) => f.statistic.score.halftime.home < f.statistic.score.halftime.away,
    awayTeam
  );

  return result;
}

export function calculateFirstHalfOverUnderPercentages(
  fixtureId: number,
  analyzedFixtures: any[]
) {
  const result: ILikelyType[] = [];
  const thresholds = [0.5, 1.5, 2.5];

  thresholds.forEach((threshold) => {
    const overPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.halftime.home + f.statistic.score.halftime.away > threshold
    );

    console.log(`---- Powyżej ${threshold}: ${overPercentage.toFixed(2)}%`);

    if (overPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: overPercentage,
        type: EventTypesEnum["1. połowa, gole powyżej/poniżej"],
        name: `Powyżej ${threshold}`,
      });
    }

    const underPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.halftime.home + f.statistic.score.halftime.away < threshold
    );

    console.log(`---- Poniżej ${threshold}: ${underPercentage.toFixed(2)}%`);

    if (underPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventStatusEnum.PENDING,
        probability: underPercentage,
        type: EventTypesEnum["1. połowa, gole powyżej/poniżej"],
        name: `Poniżej ${threshold}`,
      });
    }
  });

  return result;
}

function calculatePercentage(
  analyzedFixtures: any[],
  condition: (f: any) => boolean
): number {
  const totalFixtures = analyzedFixtures.length;
  const filteredFixtures = analyzedFixtures.filter(condition);
  return getPercentage(filteredFixtures.length, totalFixtures);
}