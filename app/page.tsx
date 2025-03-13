"use client"

import { useState, useEffect } from "react";

export default function StockOptionsCalculator() {
  const [weeklyHours, setWeeklyHours] = useState(12);
  const [hourlyPay, setHourlyPay] = useState(12);
  const [standardHourlyPay, setStandardHourlyPay] = useState(24);
  const [percentageOfStock, setPercentageOfStock] = useState(8);
  const [strikePrice, setStrikePrice] = useState(10);
  const [marketPriceAtGrant, setMarketPriceAtGrant] = useState(30);
  const [valuation, setValuation] = useState(5000000);
  const [dilution, setDilution] = useState(30);
  const [exitProbability, setExitProbability] = useState(20);
  const [soldAfterYears, setSoldAfterYears] = useState(4); // New state for sold after years
  
  // Initialize calculation results with useState
  const [stockOptions, setStockOptions] = useState(0);
  const [finalShareValue, setFinalShareValue] = useState(0);
  const [exerciseTaxableAmount, setExerciseTaxableAmount] = useState(0);
  const [exerciseTax, setExerciseTax] = useState(0);
  const [capitalGainsTaxableAmount, setCapitalGainsTaxableAmount] = useState(0);
  const [capitalGainsTax, setCapitalGainsTax] = useState(0);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState(0);
  const [grossEquityValue, setGrossEquityValue] = useState(0);
  const [netEquityValue, setNetEquityValue] = useState(0);
  const [yearlyEquityValue, setYearlyEquityValue] = useState(0);
  const [totalYearlyComp, setTotalYearlyComp] = useState(0);
  const [yearlyHourlyComp, setYearlyHourlyComp] = useState(0);
  const [standardYearlyComp, setStandardYearlyComp] = useState(0);
  const [compensationDifference, setCompensationDifference] = useState(0);
  const [weightedNetEquityValue, setWeightedNetEquityValue] = useState(0);
  const [costOfBuyingOptions, setCostOfBuyingOptions] = useState(0);
  // Add state to track if component is hydrated
  const [isHydrated, setIsHydrated] = useState(false);

  // Fixed values
  const totalShares = 100000;
  const capitalGainsTaxRate = 26; // Italian capital gains tax rate
  const employmentIncomeTaxRate = 43; // Italian highest marginal tax rate for employment income
  const weeksPerYear = 52;
  
  // Format number to prevent hydration mismatch
  const formatNumber = (num: number) => {
    if (!isHydrated) return "0";
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Simple number formatting for integers (like stock options)
  const formatInteger = (num: number) => {
    if (!isHydrated) return "0";
    return num.toLocaleString();
  };
  
  // Set hydrated state once component mounts
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Move calculations to useEffect to avoid hydration mismatch
  useEffect(() => {
    // Calculate the diluted shares after accounting for future
    const dilutedShares = totalShares / (1 - dilution / 100);

    // Calculate the number of stock options based on the percentage of total shares
    const calculatedStockOptions = Math.round(totalShares * (percentageOfStock / 100));
    setStockOptions(calculatedStockOptions);
    
    // Calculate the final share value based on the company's valuation and total shares
    const calculatedFinalShareValue = valuation / dilutedShares;
    setFinalShareValue(calculatedFinalShareValue);
    
    // Calculate the taxable amount at exercise (difference between market price at grant and strike price)
    const calculatedExerciseTaxableAmount = Math.max(0, marketPriceAtGrant - strikePrice) * calculatedStockOptions;
    setExerciseTaxableAmount(calculatedExerciseTaxableAmount);
    
    // Calculate the exercise tax based on the taxable amount and employment income tax rate
    const calculatedExerciseTax = calculatedExerciseTaxableAmount * (employmentIncomeTaxRate / 100);
    setExerciseTax(calculatedExerciseTax);
    
    // Calculate the taxable amount for capital gains (difference between final share value and market price at grant)
    const calculatedCapitalGainsTaxableAmount = Math.max(0, calculatedFinalShareValue - marketPriceAtGrant) * calculatedStockOptions;
    setCapitalGainsTaxableAmount(calculatedCapitalGainsTaxableAmount);
    
    // Calculate the capital gains tax based on the taxable amount and capital gains tax rate
    const calculatedCapitalGainsTax = calculatedCapitalGainsTaxableAmount * (capitalGainsTaxRate / 100);
    setCapitalGainsTax(calculatedCapitalGainsTax);
    
    // Calculate the total tax (sum of exercise tax and capital gains tax)
    const totalTax = calculatedExerciseTax + calculatedCapitalGainsTax;
    
    // Calculate the effective tax rate based on the total tax and the gain from exercising the options
    const calculatedEffectiveTaxRate = totalTax / ((calculatedFinalShareValue - strikePrice) * calculatedStockOptions) * 100 || 0;
    setEffectiveTaxRate(calculatedEffectiveTaxRate);
    
    // Calculate the gross equity value
    const calculatedGrossEquityValue = (calculatedFinalShareValue - strikePrice) * calculatedStockOptions;
    setGrossEquityValue(calculatedGrossEquityValue);
    
    // Calculate the net equity value after tax
    const calculatedNetEquityValue = calculatedGrossEquityValue - totalTax;
    setNetEquityValue(calculatedNetEquityValue);
    
    // Calculate the yearly equity value assuming accelerated vesting on exit
    const calculatedYearlyEquityValue = calculatedNetEquityValue / soldAfterYears;
    setYearlyEquityValue(calculatedYearlyEquityValue);
    
    // Calculate yearly compensation from hourly pay
    const calculatedYearlyHourlyComp = hourlyPay * weeklyHours * weeksPerYear;
    setYearlyHourlyComp(calculatedYearlyHourlyComp);
    
    // Calculate yearly compensation from standard position
    const calculatedStandardYearlyComp = standardHourlyPay * weeklyHours * weeksPerYear;
    setStandardYearlyComp(calculatedStandardYearlyComp);
    
    // Calculate weighted net equity value based on exit probability
    const calculatedWeightedNetEquityValue = (exitProbability / 100) * calculatedNetEquityValue;
    setWeightedNetEquityValue(calculatedWeightedNetEquityValue);
    
    // Calculate the total yearly compensation (hourly pay + yearly weighted equity value)
    const calculatedTotalYearlyComp = calculatedYearlyHourlyComp + calculatedYearlyEquityValue * (exitProbability / 100);
    setTotalYearlyComp(calculatedTotalYearlyComp);
    
    // Calculate the difference between total compensation and standard yearly compensation
    const calculatedCompensationDifference = calculatedTotalYearlyComp - calculatedStandardYearlyComp;
    setCompensationDifference(calculatedCompensationDifference);

    // Calculate the cost of buying the stock options
    const calculatedCostOfBuyingOptions = strikePrice * calculatedStockOptions;
    setCostOfBuyingOptions(calculatedCostOfBuyingOptions);
    
  }, [percentageOfStock, strikePrice, marketPriceAtGrant, valuation, dilution, weeklyHours, hourlyPay, standardHourlyPay, exitProbability, soldAfterYears]);

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen text-white">
      <h1 className="text-4xl font-extrabold text-center mb-8">Stock Options Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 bg-white p-6 rounded-lg shadow-lg text-gray-800">
        <div>
          <label className="block text-lg font-semibold">Weekly Hours</label>
          <input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(Number(e.target.value))} className="border p-2 w-full rounded-lg" />
          <p className="text-sm text-gray-500 mt-1">Hours you work per week</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Net Hourly Pay (€)</label>
          <input type="number" value={hourlyPay} onChange={(e) => setHourlyPay(Number(e.target.value))} className="border p-2 w-full rounded-lg" step="0.01" />
          <p className="text-sm text-gray-500 mt-1">Your net hourly compensation</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Standard Net Hourly Pay (€)</label>
          <input type="number" value={standardHourlyPay} onChange={(e) => setStandardHourlyPay(Number(e.target.value))} className="border p-2 w-full rounded-lg" step="0.01" />
          <p className="text-sm text-gray-500 mt-1">Net hourly pay for a standard position</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Exit Probability (%)</label>
          <input type="number" value={exitProbability} onChange={(e) => setExitProbability(Number(e.target.value))} className="border p-2 w-full rounded-lg" min="0" max="100" />
          <p className="text-sm text-gray-500 mt-1">Probability of successful exit (0-100%)</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Percentage of Stock Options (%)</label>
          <input 
            type="number" 
            value={percentageOfStock} 
            onChange={(e) => setPercentageOfStock(Number(e.target.value))} 
            className="border p-2 w-full rounded-lg" 
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">Percentage of total company stock (equity)</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Strike Price (€)</label>
          <input type="number" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value))} className="border p-2 w-full rounded-lg" />
          <p className="text-sm text-gray-500 mt-1">Price you&apos;ll pay to exercise each option</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Market Price at Grant (€)</label>
          <input type="number" value={marketPriceAtGrant} onChange={(e) => setMarketPriceAtGrant(Number(e.target.value))} className="border p-2 w-full rounded-lg" />
          <p className="text-sm text-gray-500 mt-1">Fair market value of each share when options were granted</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Expected Company Valuation (€)</label>
          <input 
            type="text" 
            value={isHydrated ? valuation.toLocaleString('en-US') : "0"} 
            onChange={(e) => setValuation(Number(e.target.value.replace(/,/g, '')))} 
            className="border p-2 w-full rounded-lg" 
            />
          <p className="text-sm text-gray-500 mt-1">Estimated future company value at liquidity event</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Expected Additional Dilution (%)</label>
          <input type="number" value={dilution} onChange={(e) => setDilution(Number(e.target.value))} className="border p-2 w-full rounded-lg" />
            <p className="text-sm text-gray-500 mt-1">Expected ownership dilution from future funding rounds</p>
            <p className="text-sm text-gray-500 mt-1">Example: If you expect 3 rounds of funding with 10% dilution each, set this to 30%</p>
        </div>
        <div>
          <label className="block text-lg font-semibold">Sold After (Years)</label>
          <input type="number" value={soldAfterYears} onChange={(e) => setSoldAfterYears(Number(e.target.value))} className="border p-2 w-full rounded-lg" min="1" />
          <p className="text-sm text-gray-500 mt-1">Number of years after which the stock is sold (assuming accelerated vesting on exit)</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Based on {formatInteger(totalShares)} fully diluted shares, {percentageOfStock}% equals {formatInteger(stockOptions)} stock options</p>
        </div>
      </div>
      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg text-gray-800">
        <h2 className="text-2xl font-bold mb-4">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg">Equity Calculations</h3>
            <p>Final Share Value: €{formatNumber(finalShareValue)}</p>
            <p>Gross Equity Value: €{formatNumber(grossEquityValue)}</p>
            <p>Cost of Buying Options: €{formatNumber(costOfBuyingOptions)}</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded-sm">
              <p className="font-semibold">Tax Breakdown:</p>
              {exerciseTaxableAmount > 0 && (
                <p>Employment Income Tax (at exercise): €{formatNumber(exerciseTax)} ({employmentIncomeTaxRate}% on €{formatNumber(exerciseTaxableAmount)})</p>
              )}
              <p>Capital Gains Tax (at sale): €{formatNumber(capitalGainsTax)} ({capitalGainsTaxRate}% on €{formatNumber(capitalGainsTaxableAmount)})</p>
              <p>Effective Tax Rate: {isHydrated ? effectiveTaxRate.toFixed(2) : "0"}%</p>
            </div>
            <p>Net Equity Value (after tax): €{formatNumber(netEquityValue)}</p>
            <p>Weighted Net Equity Value ({exitProbability}% probability): €{formatNumber(weightedNetEquityValue)}</p>
            <p>Yearly Net Equity Value: €{formatNumber(yearlyEquityValue)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Compensation Comparison</h3>
            <p>Yearly Income from Hourly Pay: €{formatNumber(yearlyHourlyComp)}</p>
            <p>Standard Position Yearly Income: €{formatNumber(standardYearlyComp)}</p>
            <p>Total Yearly Compensation (with equity): €{formatNumber(totalYearlyComp)}</p>
            <p className={compensationDifference >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              Difference vs. Standard Position: €{formatNumber(compensationDifference)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
