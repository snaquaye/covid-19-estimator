const calculateCurrentlyInfected = (reportedCases, multiplier) => {
  const result = reportedCases * multiplier;

  return result;
};

const calculateTimeInDays = (timeToElapse, periodType) => {
  let result = timeToElapse;

  if (periodType === 'weeks') result = timeToElapse * 7;
  if (periodType === 'months') result = timeToElapse * 30;

  return result;
};

const calculateFactor = (timeInDays) => {
  const result = Math.trunc(timeInDays / 3);

  return result;
};

const calculateInfectionsByRequestedTime = (currentlyInfected, factor) => {
  const result = currentlyInfected * 2 ** factor;

  return result;
};

const calculateSevereCasesByRequestedTime = (infectionsByRequestedTime) => {
  const result = Math.trunc(infectionsByRequestedTime * 0.15);

  return result;
};

const calculateHospitalBedsByRequestedTime = (
  severeCasesByRequestedTime,
  totalHospitalBeds
) => {
  const availableBeds = totalHospitalBeds * 0.35;

  return Math.trunc(availableBeds - severeCasesByRequestedTime);
};

const calculateCasesForICUByRequestedTime = (infectionsByRequestedTime) => {
  const result = Math.trunc(infectionsByRequestedTime * 0.05);

  return result;
};

const calculateCasesForVentilatorsByRequestedTime = (
  infectionsByRequestedTime
) => {
  const result = Math.trunc(infectionsByRequestedTime * 0.02);

  return result;
};

const calculateDollarsInFlight = (
  avgDailyIncomeInUSD,
  avgDailyIncomePopulation,
  timeInDays,
  infectionsByRequestedTime
) => {
  // eslint-disable-next-line max-len
  const result = (infectionsByRequestedTime * avgDailyIncomeInUSD * avgDailyIncomePopulation) / timeInDays;

  return Math.trunc(result);
};

const covid19ImpactEstimator = (data) => {
  const {
    periodType, timeToElapse, reportedCases, totalHospitalBeds, region
  } = data;
  const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = region;
  const output = {
    data,
    impact: {},
    severeImpact: {}
  };

  const timeInDays = calculateTimeInDays(timeToElapse, periodType);
  const factor = calculateFactor(timeInDays);

  const currentlyInfected = calculateCurrentlyInfected(reportedCases, 10);
  const infectionsByRequestedTime = calculateInfectionsByRequestedTime(
    currentlyInfected,
    factor
  );
  const severeCasesByRequestedTime = calculateSevereCasesByRequestedTime(
    infectionsByRequestedTime
  );
  const hospitalBedsByRequestedTime = calculateHospitalBedsByRequestedTime(
    severeCasesByRequestedTime,
    totalHospitalBeds
  );
  const casesForICUByRequestedTime = calculateCasesForICUByRequestedTime(
    infectionsByRequestedTime
  );
  const casesForVentilatorsByRequestedTime = calculateCasesForVentilatorsByRequestedTime(
    infectionsByRequestedTime
  );
  const dollarsInFlight = calculateDollarsInFlight(
    avgDailyIncomeInUSD, avgDailyIncomePopulation, timeInDays, infectionsByRequestedTime
  );

  output.impact = {
    currentlyInfected,
    infectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight
  };

  const severeCurrentlyInfected = calculateCurrentlyInfected(reportedCases, 50);
  const severeInfectionsByRequestedTime = calculateInfectionsByRequestedTime(
    severeCurrentlyInfected,
    factor
  );
  const verySevereCasesByRequestedTime = calculateSevereCasesByRequestedTime(
    severeInfectionsByRequestedTime
  );
  const severeHospitalBedsByRequestedTime = calculateHospitalBedsByRequestedTime(
    verySevereCasesByRequestedTime,
    totalHospitalBeds
  );
  const severeCasesForICUByRequestedTime = calculateCasesForICUByRequestedTime(
    severeInfectionsByRequestedTime
  );
  const serverCasesForVentilatorsByRequestedTime = calculateCasesForVentilatorsByRequestedTime(
    severeInfectionsByRequestedTime
  );
  const severeDollarsInFlight = calculateDollarsInFlight(
    avgDailyIncomeInUSD, avgDailyIncomePopulation, timeInDays, severeInfectionsByRequestedTime
  );

  output.severeImpact = {
    currentlyInfected: severeCurrentlyInfected,
    infectionsByRequestedTime: severeInfectionsByRequestedTime,
    severeCasesByRequestedTime: verySevereCasesByRequestedTime,
    hospitalBedsByRequestedTime: severeHospitalBedsByRequestedTime,
    casesForICUByRequestedTime: severeCasesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime: serverCasesForVentilatorsByRequestedTime,
    dollarsInFlight: severeDollarsInFlight
  };

  return output;
};

export default covid19ImpactEstimator;
