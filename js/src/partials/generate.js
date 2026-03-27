import * as frontend from "./frontend";
import * as error from "./errno";

import { filter, setFilterParameters, setFiltersToField } from "./filter";
import { isGradeExist, setGradeValues, addGrade } from "./grade";

let parametersNumber = 3,
  parameterKitSumm = 1,
  parameterStep = 0.2,
  parameterDecimalPlaces,
  parameterDecimalCount;

let parametersKitsArray = [],
  average = [];

const DecimalPlacesNumber = (x) =>
  x.toString().includes(".") ? x.toString().split(".").pop().length : 0;

function getParametersNumber() {
  return Number(parametersNumber);
}

function getParameterKitSumm() {
  return Number(parameterKitSumm);
}

function getParameterStep() {
  return Number(parameterStep);
}

function setParametersNumber(number) {
  parametersNumber = number;
  return parametersNumber;
}

function addAverage() {
  if (parametersKitsArray[0]) {
    average = new Array(parametersKitsArray[0].length).fill(0);
    const allParamLength = parametersKitsArray.length;
    parametersKitsArray.forEach((kit) => {
      kit.forEach((item, i) => {
        average[i] += item;
      });
    });
    average = average.map((item) => {
      return Math.round((item / allParamLength) * 100) / 100;
    });
  }
}

function getAverage() {
  return average;
}

function decimalPlacesCount() {
  let DecimalPlaces = DecimalPlacesNumber(parameterStep);
  if (DecimalPlaces < DecimalPlacesNumber(parameterKitSumm)) {
    DecimalPlaces = DecimalPlacesNumber(parameterKitSumm);
  }
  return DecimalPlaces;
}

function toInteger() {
  parameterDecimalPlaces = decimalPlacesCount();
  parameterDecimalCount = 10 ** parameterDecimalPlaces;
  parameterKitSumm *= parameterDecimalCount;
  parameterStep *= parameterDecimalCount;
}

function toDouble(parametersKit) {
  return parametersKit.map((item) => {
    return Math.round((item / parameterDecimalCount) * 100) / 100;
  });
}

function parametersKitsGenerateSettings(settingsForm) {
  // set data from filters block to hidden input
  setFiltersToField();

  // parameters to generate parameters kit
  parametersNumber = settingsForm.querySelector(
    ".js_parametrs-number-input",
  ).value;
  parameterStep = settingsForm.querySelector(".js_parametrs-step-input").value;
  const parametersKitsGenerateNumber = parameterKitSumm / parameterStep;
  if (!Number.isInteger(parametersKitsGenerateNumber)) {
    error.stepError(parameterKitSumm);
    return false;
  }

  // parameters to filter parameters kit
  if (
    !setFilterParameters(
      settingsForm.querySelector(".js_parametrs-filter-input").value,
    )
  ) {
    error.setFilterParametersError();
    return false;
  }

  // parameters to calculete grade of parameters kit
  if (
    !setGradeValues(
      settingsForm.querySelector(".js_parametrs-grade-input"),
      parametersNumber,
    )
  ) {
    error.setGradeValuesError();
    return false;
  }

  return true;
}

function processKit(kit) {
  if (!filter(kit)) return;

  let kitArray = kit.slice(0);
  if (isGradeExist()) kitArray = addGrade(kitArray);
  kitArray = toDouble(kitArray);
  parametersKitsArray.push(kitArray);
}

function parametersKitsArrayGenerate() {
  toInteger();

  const count = Number(parametersNumber);
  const step = parameterStep;
  const sum = parameterKitSumm;
  const current = new Array(count);

  parametersKitsArray = [];

  function recurse(remaining, index) {
    if (index === count - 1) {
      if (remaining >= step) {
        current[index] = remaining;
        processKit(current);
      }
      return;
    }

    const minForRest = step * (count - 1 - index);
    const maxVal = remaining - minForRest;

    for (let val = step; val <= maxVal; val += step) {
      current[index] = val;
      recurse(remaining - val, index + 1);
    }
  }

  recurse(sum, 0);

  parameterKitSumm /= parameterDecimalCount;
  parameterStep /= parameterDecimalCount;

  addAverage();
  frontend.resultAdd(isGradeExist());
}

function submitToGenerate(settingsForm, errorField, parametersTable) {
  frontend.clear(errorField, parametersTable);
  frontend.setResultTable(parametersTable);
  frontend.setErrorField(errorField);
  error.setErrorField(errorField);

  if (parametersKitsGenerateSettings(settingsForm)) {
    frontend.generateBegin();

    const t0 = performance.now();
    parametersKitsArrayGenerate();
    const t1 = performance.now();

    frontend.generateEnd();
    const t2 = performance.now();

    console.log(
      "[perf] Генерация: %s мс | Отрисовка: %s мс | Итого: %s мс",
      (t1 - t0).toFixed(2),
      (t2 - t1).toFixed(2),
      (t2 - t0).toFixed(2),
    );
  }
}

function getParametersKits() {
  return parametersKitsArray;
}

export {
  getParametersNumber,
  setParametersNumber,
  submitToGenerate,
  getParametersKits,
  getAverage,
  getParameterKitSumm,
  getParameterStep,
};
