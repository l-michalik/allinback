import { EventTypesStatusEnum, ILikelyType } from "../types";
import { EventTypesEnum } from "../constants";
import { getPercentage } from ".";

export function calculateMatchResultPercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  const result: ILikelyType[] = [];

  const homeWinPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home > f.statistic.score.fulltime.away
  );

  console.log(`---- ${homeTeam} : ${homeWinPercentage.toFixed(2)}%`);

  if (homeWinPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Wynik meczu (z wyłączeniem dogrywki)"],
      name: `${homeTeam}`,
      value: "WIN",
    });
  }

  const drawPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home === f.statistic.score.fulltime.away
  );
  console.log(`---- Remis : ${drawPercentage.toFixed(2)}%`);

  if (drawPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Wynik meczu (z wyłączeniem dogrywki)"],
      name: "Remis",
      value: "Remis",
    });
  }

  const awayWinPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home < f.statistic.score.fulltime.away
  );

  console.log(`---- ${awayTeam} : ${awayWinPercentage.toFixed(2)}%`);

  if (awayWinPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Wynik meczu (z wyłączeniem dogrywki)"],
      name: `${awayTeam}`,
      value: `WIN`,
    });
  }

  console.log(result);

  return result;
}

// ##############################################

export function calculateDoubleChancePercentages(
  fixtureId: number,
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  const result: ILikelyType[] = [];

  const homeWinOrDrawPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home >= f.statistic.score.fulltime.away
  );

  console.log(
    `---- ${homeTeam} or Draw : ${homeWinOrDrawPercentage.toFixed(2)}%`
  );

  if (homeWinOrDrawPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Podwójna szansa"],
      name: `${homeTeam} or Draw`,
      value: "HOME_OR_DRAW",
    });
  }

  const homeWinOrAwayPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home !== f.statistic.score.fulltime.away
  );

  console.log(
    `---- ${homeTeam} or ${awayTeam} : ${homeWinOrAwayPercentage.toFixed(2)}%`
  );

  if (homeWinOrAwayPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Podwójna szansa"],
      name: `${homeTeam} or ${awayTeam}`,
      value: "HOME_OR_AWAY",
    });
  }

  const awayWinOrDrawPercentage = calculatePercentage(
    analyzedFixtures,
    (f) => f.statistic.score.fulltime.home <= f.statistic.score.fulltime.away
  );

  console.log(
    `---- ${awayTeam} or Draw : ${awayWinOrDrawPercentage.toFixed(2)}%`
  );

  if (awayWinOrDrawPercentage >= 75) {
    result.push({
      fixtureId,
      status: EventTypesStatusEnum.PENDING,
      type: EventTypesEnum["Podwójna szansa"],
      name: `${awayTeam} or Draw`,
      value: "AWAY_OR_DRAW",
    });
  }

  return result;
}

// 

export function calculateOverUnderPercentages(
  fixtureId: number,
  analyzedFixtures: any[]) {
  const result: ILikelyType[] = [];

  const thresholds = [0.5, 1.5, 2.5, 3.5];

  thresholds.forEach((threshold) => {
    const overKey = `over${threshold.toString().replace(".", "")}`;
    const underKey = `under${threshold.toString().replace(".", "")}`;

    const overPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home + f.statistic.score.fulltime.away > threshold
    );

    console.log(`---- Over ${threshold}: ${overPercentage.toFixed(2)}%`);

    if (overPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventTypesStatusEnum.PENDING,
        type: EventTypesEnum["Gole Powyżej/Poniżej"],
        name: `Over ${threshold}`,
        value: overKey,
      });
    }

    const underPercentage = calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home + f.statistic.score.fulltime.away < threshold
    );

    console.log(`---- Under ${threshold}: ${underPercentage.toFixed(2)}%`);

    if (underPercentage >= 75) {
      result.push({
        fixtureId,
        status: EventTypesStatusEnum.PENDING,
        type: EventTypesEnum["Gole Powyżej/Poniżej"],
        name: `Under ${threshold}`,
        value: underKey,
      });
    }
  });

  console.log(result);
  

  return result;
}

export function calculateBTTSPercentages(analyzedFixtures: any[]) {
  console.log(
    `---- Tak: ${calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home > 0 &&
        f.statistic.score.fulltime.away > 0
    ).toFixed(2)}%`
  );
  console.log(
    `---- Nie: ${calculatePercentage(
      analyzedFixtures,
      (f) =>
        f.statistic.score.fulltime.home === 0 ||
        f.statistic.score.fulltime.away === 0
    ).toFixed(2)}%`
  );
}

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