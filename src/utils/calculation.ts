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

// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################
// ##############################################

export function calculateTeamOverUnderPercentages(
  analyzedFixtures: any[],
  teamId: number
) {
  const thresholds = [0.5, 1.5, 2.5, 3.5];

  const fixturesForTeam = analyzedFixtures.filter(
    (f) => f.teams.home.id === teamId || f.teams.away.id === teamId
  );

  if (fixturesForTeam.length === 0) {
    console.log(`---- Brak meczów dla drużyny o id ${teamId}`);
    return;
  }

  thresholds.forEach((threshold) => {
    const overKey = `homeOver${threshold.toString().replace(".", "")}`;
    const underKey = `homeUnder${threshold.toString().replace(".", "")}`;

    console.log(
      `---- Powyżej ${threshold}: ${calculatePercentage(
        fixturesForTeam,
        (f) =>
          (f.statistic.score.fulltime.home > threshold &&
            f.teams.home.id === teamId) ||
          (f.statistic.score.fulltime.away > threshold &&
            f.teams.away.id === teamId)
      ).toFixed(2)}%`
    );
    console.log(
      `---- Poniżej ${threshold}: ${calculatePercentage(
        fixturesForTeam,
        (f) =>
          (f.statistic.score.fulltime.home < threshold &&
            f.teams.home.id === teamId) ||
          (f.statistic.score.fulltime.away < threshold &&
            f.teams.away.id === teamId)
      ).toFixed(2)}%`
    );
  });
}

export function calculateHandicapPercentages(
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
): any {
  const thresholds = [1, 2];

  thresholds.forEach((threshold) => {
    console.log(
      `---- ${homeTeam} -${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.fulltime.home - threshold >
          f.statistic.score.fulltime.away
      ).toFixed(2)}%`
    );
    console.log(
      `---- ${awayTeam} -${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.fulltime.away - threshold >
          f.statistic.score.fulltime.home
      ).toFixed(2)}%`
    );
    console.log(
      `---- ${homeTeam} +${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.fulltime.home + threshold >
          f.statistic.score.fulltime.away
      ).toFixed(2)}%`
    );
    console.log(
      `---- ${awayTeam} +${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.fulltime.away + threshold >
          f.statistic.score.fulltime.home
      ).toFixed(2)}%`
    );
  });
}

export function calculateFirstHalfResultPercentages(
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  console.log(
    `---- ${homeTeam} : ${calculatePercentage(
      analyzedFixtures,
      (f) => f.statistic.score.halftime.home > f.statistic.score.halftime.away
    ).toFixed(2)}%`
  );
  console.log(
    `---- Remis : ${calculatePercentage(
      analyzedFixtures,
      (f) => f.statistic.score.halftime.home === f.statistic.score.halftime.away
    ).toFixed(2)}%`
  );
  console.log(
    `---- ${awayTeam} : ${calculatePercentage(
      analyzedFixtures,
      (f) => f.statistic.score.halftime.home < f.statistic.score.halftime.away
    ).toFixed(2)}%`
  );
}

export function calculateFirstHalfOverUnderPercentages(
  analyzedFixtures: any[]
) {
  const thresholds = [0.5, 1.5, 2.5];

  thresholds.forEach((threshold) => {
    console.log(
      `---- Powyżej ${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.halftime.home + f.statistic.score.halftime.away >
          threshold
      ).toFixed(2)}%`
    );
    console.log(
      `---- Poniżej ${threshold}: ${calculatePercentage(
        analyzedFixtures,
        (f) =>
          f.statistic.score.halftime.home + f.statistic.score.halftime.away <
          threshold
      ).toFixed(2)}%`
    );
  });
}

function calculatePercentage(
  analyzedFixtures: any[],
  condition: (f: any) => boolean
): number {
  const totalFixtures = analyzedFixtures.length;
  const filteredFixtures = analyzedFixtures.filter(condition);
  return getPercentage(filteredFixtures.length, totalFixtures);
}
