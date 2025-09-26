export function calcGross(basic: number, allowanceFixed: number, allowancePercent: number): number {
  return basic + (basic * (allowancePercent || 0)) / 100 + (allowanceFixed || 0);
}

export function calcDeductions(basic: number, deductionFixed: number, deductionPercent: number): number {
  return (deductionFixed || 0) + (basic * (deductionPercent || 0)) / 100;
}

export function calcNet(gross: number, deductions: number): number {
  return gross - deductions;
}

