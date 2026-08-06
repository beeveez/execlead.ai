import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import { calculateRoi, DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS } from "@/lib/enterpriseRoiEngine";
import RoiHero from "@/components/enterprise-roi/RoiHero";
import OrgProfileStep from "@/components/enterprise-roi/OrgProfileStep";
import InvestmentStep from "@/components/enterprise-roi/InvestmentStep";
import OperationsStep from "@/components/enterprise-roi/OperationsStep";
import AssumptionsStep from "@/components/enterprise-roi/AssumptionsStep";
import RoiResults from "@/components/enterprise-roi/RoiResults";
import RoiCharts from "@/components/enterprise-roi/RoiCharts";
import RoiScenarios from "@/components/enterprise-roi/RoiScenarios";
import RoiInsights from "@/components/enterprise-roi/RoiInsights";
import RoiBusinessCase from "@/components/enterprise-roi/RoiBusinessCase";

const STEPS = [
  { n: 1, title: "Organization Profile", Comp: OrgProfileStep },
  { n: 2, title: "Current Leadership Investment", Comp: InvestmentStep },
  { n: 3, title: "Current Leadership Operations", Comp: OperationsStep },
  { n: 4, title: "Configurable Assumptions", Comp: AssumptionsStep },
];

function Disclaimer() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[11px] text-white/55 leading-relaxed">
      The Enterprise Leadership ROI Calculator™ provides scenario-based financial estimates using customer inputs and configurable assumptions. Results support planning and business case development. Actual outcomes depend on implementation, organizational adoption, leadership engagement, and operational factors. EXECLEAD.AI does not guarantee financial results.
    </div>
  );
}

export default function EnterpriseROI() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [results, setResults] = useState(null);
  const [insights, setInsights] = useState([]);

  const Comp = STEPS[step - 1].Comp;
  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const calculate = () => setResults(calculateRoi(inputs, assumptions));

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <RoiHero />
        <Disclaimer />

        {!results && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-5 overflow-x-auto">
              {STEPS.map((s) => (
                <button key={s.n} onClick={() => setStep(s.n)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${step === s.n ? "bg-accent-orange/15 text-accent-orange" : "text-white/40 hover:text-white/70"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === s.n ? "bg-accent-orange text-white" : "bg-white/10 text-white/50"}`}>{s.n}</span>
                  {s.title}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <Comp values={step <= 3 ? inputs : assumptions} onChange={step <= 3 ? setInputs : setAssumptions} />
            </div>
            <div className="flex items-center justify-between mt-5">
              <button onClick={back} disabled={step === 1} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 disabled:opacity-30">
                <ArrowLeft size={15} /> Back
              </button>
              {step < 4 ? (
                <button onClick={next} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium px-5 py-2.5 rounded-xl">
                  Next <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={calculate} className="inline-flex items-center gap-1.5 bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
                  <Calculator size={15} /> Calculate Enterprise ROI
                </button>
              )}
            </div>
          </div>
        )}

        {results && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => setResults(null)} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80">
                <ArrowLeft size={15} /> Edit Inputs
              </button>
              <span className="text-[11px] text-white/40">Prepared for {inputs.organizationName || "your organization"}</span>
            </div>
            <RoiResults roi={results} />
            <RoiCharts roi={results} inputs={inputs} />
            <RoiScenarios inputs={inputs} assumptions={assumptions} />
            <RoiInsights inputs={inputs} roi={results} onInsights={setInsights} />
            <RoiBusinessCase inputs={inputs} assumptions={assumptions} roi={results} insights={insights} />
            <Disclaimer />
          </div>
        )}
      </div>
    </div>
  );
}