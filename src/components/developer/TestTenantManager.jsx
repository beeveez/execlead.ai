import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useDeveloper } from "@/lib/DeveloperContext";
import { Building2, Loader2, CheckCircle2, Users } from "lucide-react";

const DEPARTMENTS = ["HR", "IT", "Finance", "Operations", "Sales", "Engineering", "Marketing"];
const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Margaret", "Matthew", "Lisa", "Anthony", "Betty", "Donald", "Dorothy", "Mark", "Sandra", "Paul", "Ashley", "Steven", "Kimberly", "Donna", "Andrew", "Emily", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah", "Edward", "Stephanie", "Ronald", "Rebecca", "Timothy", "Laura", "Jason", "Sharon", "Jeffrey", "Cynthia"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

const ROLES_BY_DEPT = {
  HR: ["HR Analyst", "HR Manager", "HR Director"],
  IT: ["IT Analyst", "IT Manager", "IT Director", "Cloud Engineer"],
  Finance: ["Financial Analyst", "Finance Manager", "Finance Director"],
  Operations: ["Operations Analyst", "Operations Manager", "Operations Director"],
  Sales: ["Sales Rep", "Sales Manager", "Sales Director"],
  Engineering: ["Software Engineer", "Senior Engineer", "Engineering Manager"],
  Marketing: ["Marketing Specialist", "Marketing Manager", "Marketing Director"],
};

export default function TestTenantManager() {
  const { sandbox } = useDeveloper();
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);

  const createTestTenant = async () => {
    setCreating(true);
    setResult(null);
    try {
      const orgName = sandbox ? "[SANDBOX] EXECLEAD Internal" : "EXECLEAD Internal";

      const org = await base44.entities.Organization.create({
        name: orgName,
        plan: "enterprise",
        seats_total: 150,
        seats_used: 100,
        industry: "Technology",
        country: "Global",
        description: "EXECLEAD.AI internal test organization for enterprise testing.",
      });

      const employees = [];
      for (let i = 0; i < 100; i++) {
        const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
        const lastName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const roles = ROLES_BY_DEPT[dept];
        const role = roles[i % roles.length];
        employees.push({
          full_name: `${firstName} ${lastName}`,
          current_role: role,
          current_company: "EXECLEAD Internal",
          target_role: role,
          target_company: "EXECLEAD Internal",
          industry: "Technology",
          years_experience: 3 + (i % 20),
          organization_id: org.id,
          subscription_plan: "enterprise",
          subscription_status: "active",
          xp_points: Math.floor(Math.random() * 5000),
          challenges_completed: Math.floor(Math.random() * 50),
          sessions_completed: Math.floor(Math.random() * 30),
          promotion_readiness: Math.floor(Math.random() * 100),
          leadership_maturity: 30 + Math.floor(Math.random() * 60),
          commercial_maturity: 20 + Math.floor(Math.random() * 60),
          communication_growth: 25 + Math.floor(Math.random() * 60),
          executive_presence: 20 + Math.floor(Math.random() * 60),
          confidence: 30 + Math.floor(Math.random() * 60),
          interview_readiness: 20 + Math.floor(Math.random() * 60),
          streak_days: Math.floor(Math.random() * 30),
          skills: [dept, "Leadership", "Communication"],
          strong_areas: [role.split(" ")[0]],
          weak_areas: ["Strategic Planning"],
          last_active_date: new Date().toISOString().split("T")[0],
        });
      }
      await base44.entities.UserProfile.bulkCreate(employees);

      const successionPlans = [
        { role_title: "Chief Technology Officer", department: "IT", incumbent_name: "Michael Rodriguez", successors_json: JSON.stringify([{ name: "Jennifer Park", readiness: 75, notes: "Strong technical leader" }, { name: "David Kumar", readiness: 60, notes: "Needs strategic development" }]), risk_level: "high", status: "developing", notes: "Test succession plan for CTO role." },
        { role_title: "VP of Sales", department: "Sales", incumbent_name: "Sarah Chen", successors_json: JSON.stringify([{ name: "Robert Taylor", readiness: 82, notes: "Ready for promotion" }]), risk_level: "medium", status: "ready", notes: "Test succession plan for VP Sales." },
        { role_title: "HR Director", department: "HR", incumbent_name: "Patricia Williams", successors_json: JSON.stringify([{ name: "Linda Martinez", readiness: 68, notes: "Developing leadership depth" }]), risk_level: "low", status: "identified", notes: "Test succession plan for HR Director." },
      ];
      await base44.entities.SuccessionPlan.bulkCreate(successionPlans);

      const assignments = [
        { title: "Executive Leadership Program", assignee_name: "Jennifer Park", learning_path: "Leadership", due_date: "2026-09-01", status: "in_progress", progress: 45, assigned_by_name: "HR Team", priority: "high" },
        { title: "Digital Transformation Track", assignee_name: "David Kumar", learning_path: "Digital Transformation", due_date: "2026-08-15", status: "assigned", progress: 0, assigned_by_name: "HR Team", priority: "medium" },
        { title: "Strategic Communication", assignee_name: "Robert Taylor", learning_path: "Executive Communication", due_date: "2026-07-30", status: "completed", progress: 100, assigned_by_name: "HR Team", priority: "high" },
        { title: "Cloud Strategy Certification", assignee_name: "James Wilson", learning_path: "Cloud", due_date: "2026-10-01", status: "in_progress", progress: 25, assigned_by_name: "HR Team", priority: "medium" },
      ];
      await base44.entities.LearningAssignment.bulkCreate(assignments);

      setResult({ success: true, orgName: org.name, employees: employees.length, successionPlans: successionPlans.length, assignments: assignments.length });
    } catch (e) {
      setResult({ success: false, error: e.message || "Failed to create test tenant" });
    }
    setCreating(false);
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Building2 size={14} className="text-emerald-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Enterprise Test Tenant</h2>
        {sandbox && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">SANDBOX</span>}
      </div>
      <p className="text-white/30 text-xs mb-4">Create "EXECLEAD Internal" organization with 100 demo employees, managers, analytics, and reports across all departments.</p>

      {result?.success && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Test tenant created: {result.orgName}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><div className="text-white font-bold">{result.employees}</div><div className="text-white/30">Employees</div></div>
            <div><div className="text-white font-bold">{result.successionPlans}</div><div className="text-white/30">Succession Plans</div></div>
            <div><div className="text-white font-bold">{result.assignments}</div><div className="text-white/30">Assignments</div></div>
          </div>
        </div>
      )}
      {result && !result.success && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mb-4 text-red-400 text-sm">{result.error}</div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-4">
        {DEPARTMENTS.map((d) => (
          <div key={d} className="bg-white/5 rounded-lg p-2 text-center">
            <Users size={12} className="mx-auto text-white/30 mb-1" />
            <div className="text-white/40 text-xs">{d}</div>
          </div>
        ))}
      </div>

      <button onClick={createTestTenant} disabled={creating}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
        {creating ? <><Loader2 size={16} className="animate-spin" /> Creating Test Tenant...</> : <><Building2 size={16} /> Create EXECLEAD Internal</>}
      </button>
    </div>
  );
}