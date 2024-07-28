import { getPercentage } from ".";

function calculatePercentage(
  analyzedFixtures: any[],
  condition: (f: any) => boolean
): number {
  const totalFixtures = analyzedFixtures.length;
  const filteredFixtures = analyzedFixtures.filter(condition);
  return getPercentage(filteredFixtures.length, totalFixtures);
}

export function calculateMatchResultPercentages(
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  console.log(`---- ${homeTeam} : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home > f.statistic.score.fulltime.away).toFixed(2)}%`);
  console.log(`---- Draw : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home === f.statistic.score.fulltime.away).toFixed(2)}%`);
  console.log(`---- ${awayTeam} : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home < f.statistic.score.fulltime.away).toFixed(2)}%`);
}

export function calculateDoubleChancePercentages(
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  console.log(`---- ${homeTeam} or Draw : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home >= f.statistic.score.fulltime.away).toFixed(2)}%`);
  console.log(`---- ${homeTeam} or ${awayTeam} : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home !== f.statistic.score.fulltime.away).toFixed(2)}%`);
  console.log(`---- ${awayTeam} or Draw : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home <= f.statistic.score.fulltime.away).toFixed(2)}%`);
}

export function calculateOverUnderPercentages(analyzedFixtures: any[]) {
  const thresholds = [0.5, 1.5, 2.5, 3.5];

  thresholds.forEach((threshold) => {
    const overKey = `over${threshold.toString().replace(".", "")}`;
    const underKey = `under${threshold.toString().replace(".", "")}`;

    console.log(`---- Powyżej ${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home + f.statistic.score.fulltime.away > threshold).toFixed(2)}%`);
    console.log(`---- Poniżej ${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home + f.statistic.score.fulltime.away < threshold).toFixed(2)}%`);
  });
}

export function calculateBTTSPercentages(analyzedFixtures: any[]) {
  console.log(`---- Tak: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home > 0 && f.statistic.score.fulltime.away > 0).toFixed(2)}%`);
  console.log(`---- Nie: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home === 0 || f.statistic.score.fulltime.away === 0).toFixed(2)}%`);
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

    console.log(`---- Powyżej ${threshold}: ${calculatePercentage(fixturesForTeam, (f) => (f.statistic.score.fulltime.home > threshold && f.teams.home.id === teamId) || (f.statistic.score.fulltime.away > threshold && f.teams.away.id === teamId)).toFixed(2)}%`);
    console.log(`---- Poniżej ${threshold}: ${calculatePercentage(fixturesForTeam, (f) => (f.statistic.score.fulltime.home < threshold && f.teams.home.id === teamId) || (f.statistic.score.fulltime.away < threshold && f.teams.away.id === teamId)).toFixed(2)}%`);
  });
}

export function calculateHandicapPercentages(analyzedFixtures: any[], homeTeam: string, awayTeam: string): any {
  const thresholds = [1, 2];

  thresholds.forEach(threshold => {
    console.log(`---- ${homeTeam} -${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home - threshold > f.statistic.score.fulltime.away).toFixed(2)}%`);
    console.log(`---- ${awayTeam} -${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.away - threshold > f.statistic.score.fulltime.home).toFixed(2)}%`);
    console.log(`---- ${homeTeam} +${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.home + threshold > f.statistic.score.fulltime.away).toFixed(2)}%`);
    console.log(`---- ${awayTeam} +${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.fulltime.away + threshold > f.statistic.score.fulltime.home).toFixed(2)}%`);
  });
}

export function calculateFirstHalfResultPercentages(
  analyzedFixtures: any[],
  homeTeam: string,
  awayTeam: string
) {
  console.log(`---- ${homeTeam} : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.halftime.home > f.statistic.score.halftime.away).toFixed(2)}%`);
  console.log(`---- Remis : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.halftime.home === f.statistic.score.halftime.away).toFixed(2)}%`);
  console.log(`---- ${awayTeam} : ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.halftime.home < f.statistic.score.halftime.away).toFixed(2)}%`);
}

export function calculateFirstHalfOverUnderPercentages(
  analyzedFixtures: any[]
) {
  const thresholds = [0.5, 1.5, 2.5];

  thresholds.forEach((threshold) => {
    console.log(`---- Powyżej ${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.halftime.home + f.statistic.score.halftime.away > threshold).toFixed(2)}%`);
    console.log(`---- Poniżej ${threshold}: ${calculatePercentage(analyzedFixtures, (f) => f.statistic.score.halftime.home + f.statistic.score.halftime.away < threshold).toFixed(2)}%`);
  });
}
