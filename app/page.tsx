"use client"

import { useState, useEffect } from "react";

export default function StockOptionsCalculator() {
  const [salary, setSalary] = useState(7500);
  const [percentageOfStock, setPercentageOfStock] = useState(1);
  const [strikePrice, setStrikePrice] = useState(0);
  const [marketPriceAtGrant, setMarketPriceAtGrant] = useState(0);
  const [valuation, setValuation] = useState(10000000);
  const [dilution, setDilution] = useState(30);
  
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

  // Fixed values
  const totalShares = 100000;
  const capitalGainsTaxRate = 26; // Italian capital gains tax rate
  const employmentIncomeTaxRate = 43; // Italian highest marginal tax rate for employment income
  
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
    
    // Calculate the yearly equity value assuming a 4-year vesting period
    const calculatedYearlyEquityValue = calculatedNetEquityValue / 4;
    setYearlyEquityValue(calculatedYearlyEquityValue);
  
    
    // Calculate the total yearly compensation (salary + yearly equity value)
    const calculatedTotalYearlyComp = salary + calculatedYearlyEquityValue;
    setTotalYearlyComp(calculatedTotalYearlyComp);
  }, [salary, percentageOfStock, strikePrice, marketPriceAtGrant, valuation, dilution]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Stock Options Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label>Net Yearly Salary (€)</label>
          <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="border p-2 w-full" />
          <p className="text-sm text-gray-500 mt-1">Your annual pre-tax salary in EUR</p>
        </div>
        <div>
          <label>Percentage of Stock Options (%)</label>
          <input 
            type="number" 
            value={percentageOfStock} 
            onChange={(e) => setPercentageOfStock(Number(e.target.value))} 
            className="border p-2 w-full" 
            step="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">Percentage of total company stock (equity)</p>
        </div>
        <div>
          <label>Strike Price (€)</label>
          <input type="number" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value))} className="border p-2 w-full" />
          <p className="text-sm text-gray-500 mt-1">Price you'll pay to exercise each option</p>
        </div>
        <div>
          <label>Market Price at Grant (€)</label>
          <input type="number" value={marketPriceAtGrant} onChange={(e) => setMarketPriceAtGrant(Number(e.target.value))} className="border p-2 w-full" />
          <p className="text-sm text-gray-500 mt-1">Fair market value of each share when options were granted</p>
        </div>
        <div>
          <label>Expected Company Valuation (€)</label>
          <input type="number" value={valuation} onChange={(e) => setValuation(Number(e.target.value))} className="border p-2 w-full" />
          <p className="text-sm text-gray-500 mt-1">Estimated future company value at liquidity event</p>
        </div>
        <div>
          <label>Expected Additional Dilution (%)</label>
          <input type="number" value={dilution} onChange={(e) => setDilution(Number(e.target.value))} className="border p-2 w-full" />
          <p className="text-sm text-gray-500 mt-1">Expected ownership dilution from future funding rounds</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-500">Based on {totalShares.toLocaleString()} fully diluted shares, {percentageOfStock}% equals {stockOptions.toLocaleString()} stock options</p>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold">Results</h2>
        <p>Final Share Value: €{finalShareValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Gross Equity Value: €{grossEquityValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className="mt-2 p-2 bg-yellow-100 rounded-sm">
          <p className="font-semibold">Tax Breakdown:</p>
          {exerciseTaxableAmount > 0 && (
            <p>Employment Income Tax (at exercise): €{exerciseTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({employmentIncomeTaxRate}% on €{exerciseTaxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
          )}
          <p>Capital Gains Tax (at sale): €{capitalGainsTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({capitalGainsTaxRate}% on €{capitalGainsTaxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
          <p>Effective Tax Rate: {effectiveTaxRate.toFixed(2)}%</p>
        </div>
        <p>Net Equity Value (after tax): €{netEquityValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Yearly Net Equity Value: €{yearlyEquityValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Total Yearly Compensation: €{totalYearlyComp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}
