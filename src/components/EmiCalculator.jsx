import { useState } from "react";
import { emi, inr } from "../utils/format.js";

export default function EmiCalculator({ price }) {
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.75);
  const [years, setYears] = useState(20);
  const principal = price * (1 - down / 100);
  const monthly = emi(principal, rate, years);
  const total = monthly * years * 12;
  return (
    <div className="emi">
      <h3>Home loan estimate</h3>
      <div className="emi-grid">
        <label>Down payment <b>{down}%</b><input type="range" min="0" max="80" step="5" value={down} onChange={(e) => setDown(+e.target.value)} /></label>
        <label>Interest rate <b>{rate}%</b><input type="range" min="6" max="14" step="0.25" value={rate} onChange={(e) => setRate(+e.target.value)} /></label>
        <label>Tenure <b>{years} yrs</b><input type="range" min="5" max="30" step="1" value={years} onChange={(e) => setYears(+e.target.value)} /></label>
      </div>
      <div className="emi-out">
        <div><small>Monthly EMI</small><b className="gold">{inr(monthly)}</b></div>
        <div><small>Loan amount</small><b>{inr(principal)}</b></div>
        <div><small>Total interest</small><b>{inr(total - principal)}</b></div>
      </div>
      <p className="note">Indicative only. Actual rates and eligibility depend on your bank.</p>
    </div>
  );
}
