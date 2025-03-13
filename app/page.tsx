"use client"

import { useState, useEffect } from "react";

export default function StockOptionsCalculator() {
  const [weeklyHours, setWeeklyHours] = useState(12);
  const [hourlyPay, setHourlyPay] = useState(12);
  const [standardHourlyPay, setStandardHourlyPay] = useState(24);
  const [percentageOfStock, setPercentageOfStock] = useState(8);
  const [strikePrice, setStrikePrice] = useState(10);
  const [soldValuePerShare, setSoldValuePerShare] = useState(30);
  const [valuation, setValuation] = useState(5000000);
  const [dilution, setDilution] = useState(30);
  const [exitProbability, setExitProbability] = useState(20);
  const [soldAfterYears, setSoldAfterYears] = useState(4); // New state for sold after years
  
  // Initialize calculation results with useState
  const [stockOptions, setStockOptions] = useState(0);
  const [dilutedShares, setDilutedShares] = useState(100000);
  const [finalShareValue, setFinalShareValue] = useState(0);
  const [exerciseTaxableAmount, setExerciseTaxableAmount] = useState(0);
  const [exerciseTax, setExerciseTax] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [capitalGainsTaxableAmount, setCapitalGainsTaxableAmount] = useState(0);
  const [capitalGainsTax, setCapitalGainsTax] = useState(0);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState(0);
  const [grossEquityValue, setGrossEquityValue] = useState(0);
  const [grossSoldStockValue, setGrossSoldStockValue] = useState(0);
  const [netEquityValue, setNetEquityValue] = useState(0);
  const [netSoldValue, setNetSoldValue] = useState(0);
  const [yearlySoldValue, setYearlySoldValue] = useState(0);
  const [totalYearlyComp, setTotalYearlyComp] = useState(0);
  const [yearlyHourlyComp, setYearlyHourlyComp] = useState(0);
  const [standardYearlyComp, setStandardYearlyComp] = useState(0);
  const [compensationDifference, setCompensationDifference] = useState(0);
  const [weightedNetSoldValue, setWeightedNetSoldValue] = useState(0);
  const [weightedYearlyNetSoldValue, setWeightedYearlyNetSoldValue] = useState(0);
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

  useEffect(() => {
    setSoldValuePerShare(finalShareValue);
  }, [finalShareValue]);

  // Move calculations to useEffect to avoid hydration mismatch
  useEffect(() => {
    // Calculate the diluted shares after accounting for future
    const calculatedDilutedShares = totalShares * (1 + (dilution / 100));
    setDilutedShares(calculatedDilutedShares);

    // Calculate the number of stock options based on the percentage of total shares
    const calculatedStockOptions = Math.round(totalShares * (percentageOfStock / 100));
    setStockOptions(calculatedStockOptions);
    
    // Calculate the final share value based on the company's valuation and total shares
    const calculatedFinalShareValue = valuation / calculatedDilutedShares;
    setFinalShareValue(calculatedFinalShareValue);
    
    // Calculate the taxable amount at exercise (difference between market price at grant and strike price)
    const calculatedExerciseTaxableAmount = Math.max(0, calculatedFinalShareValue - strikePrice) * calculatedStockOptions;
    setExerciseTaxableAmount(calculatedExerciseTaxableAmount);
    
    // Calculate the exercise tax based on the taxable amount and employment income tax rate
    const calculatedExerciseTax = calculatedExerciseTaxableAmount * (employmentIncomeTaxRate / 100);
    setExerciseTax(calculatedExerciseTax);
    
    // Calculate the taxable amount for capital gains (difference between final share value and market price at grant)
    const calculatedCapitalGainsTaxableAmount = Math.max(0, soldValuePerShare - calculatedFinalShareValue) * calculatedStockOptions;
    setCapitalGainsTaxableAmount(calculatedCapitalGainsTaxableAmount);
    
    // Calculate the capital gains tax based on the taxable amount and capital gains tax rate
    const calculatedCapitalGainsTax = calculatedCapitalGainsTaxableAmount * (capitalGainsTaxRate / 100);
    setCapitalGainsTax(calculatedCapitalGainsTax);
    
    // Calculate the total tax (sum of exercise tax and capital gains tax)
    const calculatedTotalTax = calculatedExerciseTax + calculatedCapitalGainsTax;
    setTotalTax(calculatedTotalTax);
    
    // Calculate the gross equity value
    const calculatedGrossEquityValue = (calculatedFinalShareValue - strikePrice) * calculatedStockOptions;
    setGrossEquityValue(calculatedGrossEquityValue);

    // Calculate the cost of buying the stock options
    const calculatedCostOfBuyingOptions = strikePrice * calculatedStockOptions;
    setCostOfBuyingOptions(calculatedCostOfBuyingOptions);

    // Calculate the gross value of the sold stock
    const calculatedGrossSoldStockValue = soldValuePerShare * calculatedStockOptions;
    setGrossSoldStockValue(calculatedGrossSoldStockValue);

    // Calculate the effective tax rate based on the total tax and the gain from exercising the options
    const calculatedEffectiveTaxRate = calculatedTotalTax / calculatedGrossSoldStockValue * 100 || 0;
    setEffectiveTaxRate(calculatedEffectiveTaxRate);
    
    // Calculate the net equity value after tax
    const calculatedNetEquityValue = calculatedGrossEquityValue - calculatedExerciseTax;
    setNetEquityValue(calculatedNetEquityValue);

    // Calculate the net sold value after tax
    const calculatedNetSoldValue = calculatedGrossSoldStockValue - calculatedTotalTax - calculatedCostOfBuyingOptions;
    setNetSoldValue(calculatedNetSoldValue);
    
    // Calculate the yearly equity value assuming accelerated vesting on exit
    const calculatedYearlySoldValue = calculatedNetSoldValue / soldAfterYears;
    setYearlySoldValue(calculatedYearlySoldValue);
    
    // Calculate yearly compensation from hourly pay
    const calculatedYearlyHourlyComp = hourlyPay * weeklyHours * weeksPerYear;
    setYearlyHourlyComp(calculatedYearlyHourlyComp);
    
    // Calculate yearly compensation from standard position
    const calculatedStandardYearlyComp = standardHourlyPay * weeklyHours * weeksPerYear;
    setStandardYearlyComp(calculatedStandardYearlyComp);
    
    // Calculate weighted net sold value based on exit probability
    const calculatedWeightedNetSoldValue = (exitProbability / 100) * calculatedNetSoldValue;
    setWeightedNetSoldValue(calculatedWeightedNetSoldValue);

    // Calculate the weighted yearly net sold value based on exit probability
    const calculatedWeightedYearlyNetSoldValue = (exitProbability / 100) * calculatedYearlySoldValue;
    setWeightedYearlyNetSoldValue(calculatedWeightedYearlyNetSoldValue);
    
    // Calculate the total yearly compensation (hourly pay + yearly weighted equity value)
    const calculatedTotalYearlyComp = calculatedYearlyHourlyComp + calculatedYearlySoldValue * (exitProbability / 100);
    setTotalYearlyComp(calculatedTotalYearlyComp);
    
    // Calculate the difference between total compensation and standard yearly compensation
    const calculatedCompensationDifference = calculatedTotalYearlyComp - calculatedStandardYearlyComp;
    setCompensationDifference(calculatedCompensationDifference);
    
  }, [percentageOfStock, strikePrice, soldValuePerShare, valuation, dilution, weeklyHours, hourlyPay, standardHourlyPay, exitProbability, soldAfterYears]);

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
          <label className="block text-lg font-semibold">Expected Share Sale Price (€)</label>
          <div className="flex">
            <input 
              type="number" 
              value={soldValuePerShare} 
              onChange={(e) => setSoldValuePerShare(Number(e.target.value))} 
              className="border p-2 w-full rounded-lg" 
            />
            <button 
              onClick={() => setSoldValuePerShare(finalShareValue)} 
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 4.293a1 1 0 00-1.414 1.414A3.978 3.978 0 0114 10a4 4 0 11-4-4 1 1 0 100-2 6 6 0 106 6 5.978 5.978 0 00-1.293-3.707z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">The value at which you expect to sell each share</p>
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
            <p>Final Share Value: €{formatNumber(finalShareValue)} on {formatNumber(dilutedShares)} fully diluted shares</p>
            <p>Gross Equity Value: €{formatNumber(grossEquityValue)}</p>
            <p>Gross Sold Stock Value: €{formatNumber(grossSoldStockValue)}</p>
            <p>Cost of Buying Options: €{formatNumber(costOfBuyingOptions)}</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded-sm">
              <p className="font-semibold">Tax Breakdown:</p>
              {exerciseTaxableAmount > 0 && (
                <p>Employment Income Tax (at exercise): €{formatNumber(exerciseTax)} ({employmentIncomeTaxRate}% on €{formatNumber(exerciseTaxableAmount)})</p>
              )}
              <p>Capital Gains Tax (at sale): €{formatNumber(capitalGainsTax)} ({capitalGainsTaxRate}% on €{formatNumber(capitalGainsTaxableAmount)})</p>
              <p>Total Tax: €{formatNumber(totalTax)}</p>
              <p>Effective Tax Rate: {isHydrated ? effectiveTaxRate.toFixed(2) : "0"}%</p>
            </div>
            <p>Net Equity Value (after tax): €{formatNumber(netEquityValue)}</p>
            <p>Net Sold Value (after tax and buying): €{formatNumber(netSoldValue)}</p>
            <p>Weighted Net Sold Value ({exitProbability}% probability): €{formatNumber(weightedNetSoldValue)}</p>
            <p>Yearly Net Sold Value: €{formatNumber(yearlySoldValue)}</p>
            <p>Weighted Yearly Net Sold Value ({exitProbability}% probability): €{formatNumber(weightedYearlyNetSoldValue)}</p>
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
