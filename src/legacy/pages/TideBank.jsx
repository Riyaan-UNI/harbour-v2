import { useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Button from "../components/Button.jsx";
import CountUp from "../components/CountUp.jsx";
import { Icon } from "../components/Icons.jsx";
import { toast } from "../components/Toast.jsx";

function readBalance(){try{return Math.max(0,Number(localStorage.getItem("harbour-tide-balance")||"3"));}catch{return 3;}}
export default function TideBank(){
  const [balance,setBalance]=useState(readBalance);
  const [ledger,setLedger]=useState([]);
  function change(amount){
    const next=Math.max(0,balance+amount);
    if(next===balance) return;
    setBalance(next);
    localStorage.setItem("harbour-tide-balance",String(next));
    setLedger(previous => [{
      id:`${Date.now()}-${previous.length}`,
      amount: next - balance,
      label: amount > 0 ? "A tide added to your balance" : "A tide used from your balance",
      at: new Intl.DateTimeFormat("en-HK", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    }, ...previous].slice(0, 8));
    toast(amount > 0 ? "One tide added." : "One tide used.", { tone: amount > 0 ? "success" : "default" });
  }
  return <section className="page figma-toolpage tide-page">
    <PageHeading eyebrow="TIDE BANK · SIMULATED" title="Small acts make a difference." description="A playful look at how a community credit idea could feel. Nothing here has monetary value."/>
    <div className="demo-banner">SIMULATION <span>Local demo balance only. No real credits or matching.</span></div>

    <div className="tide-card">
      <div className="tide-card-top"><span>YOUR TIDE BALANCE</span><span>DEMO ACCOUNT</span></div>
      <div className="tide-balance">
        <CountUp value={balance} format={value => String(value).padStart(2, "0")} />
        <span>tides</span>
      </div>
      <p>For showing up, sharing a skill, or lending a hand.</p>
      <div className="tide-actions">
        <Button onClick={()=>change(1)} icon="plus">Add 1 tide</Button>
        <Button variant="secondary" onClick={()=>change(-1)} disabled={!balance} icon="minus">Use 1 tide</Button>
      </div>
      <small>This balance is stored only in this browser.</small>
    </div>

    <section className="tide-activity" aria-label="Recent tide activity">
      <h2>Recent activity</h2>
      {ledger.length === 0
        ? <p className="panel-note">Your changes will be listed here as you add or use tides in this session.</p>
        : <ul className="tide-ledger">{ledger.map(item => (
            <li key={item.id} className={`tide-ledger-row ${item.amount > 0 ? "is-credit" : "is-debit"}`}>
              <Icon name={item.amount > 0 ? "plus" : "minus"} size={18} />
              <span>{item.label}<br/><small className="panel-note">{item.at}</small></span>
              <span className="amount">{item.amount > 0 ? "+" : "−"}{Math.abs(item.amount)}</span>
            </li>
          ))}</ul>}
    </section>
  </section>;
}
