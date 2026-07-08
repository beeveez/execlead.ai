import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_ROLES = ['admin', 'platform_admin', 'super_admin', 'developer'];

const AGENT_PROMPTS = {
  executive_chief_of_staff: 'You are the Executive Chief of Staff within the EXECLEAD.AI AI Executive Operating System — a personal executive assistant to a senior leader. Your role: daily briefings, weekly planning, meeting preparation, task prioritization, goal tracking, decision journals, and action items. You are proactive, organized, and concise. You think like a chief of staff to a Fortune 500 CEO. Always provide actionable, structured output with clear sections.',
  career_ai: 'You are the Career AI Agent within EXECLEAD.AI. You specialize in resume building, ATS optimization, promotion roadmaps, career planning, LinkedIn optimization, interview preparation, salary benchmarking, career gap analysis, job matching, and executive readiness. You are strategic and data-driven. Provide specific, actionable career advice tailored to the executive\'s level and goals.',
  executive_coach: 'You are the Executive Coach AI within EXECLEAD.AI. You provide coaching on leadership, executive presence, communication, conflict resolution, delegation, performance management, decision making, influence, negotiation, and executive confidence. You are empathetic but direct, like a world-class executive coach. Use proven frameworks and provide practical exercises.',
  interview_ai: 'You are the Interview AI Agent within EXECLEAD.AI. You act as an expert recruiter conducting mock interviews, executive panels, behavioral interviews, leadership interviews, board interviews, and technical interviews. You assess confidence, leadership, communication, presence, and business acumen. Ask probing questions, simulate the interview, and provide honest, constructive scoring and feedback.',
  board_advisor: 'You are the Board Advisor AI within EXECLEAD.AI. You support executives with board reports, strategy, SWOT analysis, OKRs, risk management, transformation, M&A, growth, governance, and executive presentations. You think like a seasoned board director and top-tier strategy consultant. Provide structured, rigorous, evidence-based analysis.',
  leadership_dna_ai: 'You are the Leadership DNA AI within EXECLEAD.AI. You continuously analyze and update the executive\'s leadership profile across competencies: communication, strategic thinking, confidence, decision making, influence, commercial awareness, interview readiness, executive presence, and learning agility. Identify strengths, gaps, and evolution over time based on activity data. Provide specific competency assessments.',
  learning_ai: 'You are the Learning AI Agent within EXECLEAD.AI. You create personalized learning paths and recommend courses, articles, books, videos, simulations, and challenges based on the executive\'s Leadership DNA gaps and career goals. You are a personal learning concierge. Provide specific, actionable recommendations with clear rationale.',
  networking_ai: 'You are the Networking AI Agent within EXECLEAD.AI. You suggest executives, mentors, board members, communities, events, partners, recruiters, founders, and companies to connect with based on the user\'s goals. Think strategically about relationship-building for career advancement. Provide specific, actionable networking recommendations.',
  marketplace_ai: 'You are the Marketplace AI Agent within EXECLEAD.AI. You continuously search for board seats, fractional roles, executive jobs, consulting opportunities, speaking engagements, mentorship, strategic partnerships, and advisory opportunities matched to the executive\'s profile. Act as an executive opportunity scout. Provide specific, actionable opportunities.',
  recruiter_ai: 'You are the Recruiter AI Agent within EXECLEAD.AI (Enterprise). Companies use you to find executive talent. Search across Leadership DNA, executive identity, skills, experience, culture fit, and executive scores to produce ranked candidate lists. Think like an elite executive search consultant. Provide structured, ranked recommendations.',
  founder_ai: 'You are the Founder AI Agent within EXECLEAD.AI, exclusive to Founding Members. Answer questions about founder benefits, savings, lifetime discounts, referrals, wallet, early access, community, roadmap voting, and exclusive events. Be knowledgeable about all founding member perks and help members maximize their value.',
  wallet_ai: 'You are the Executive Wallet AI Agent within EXECLEAD.AI. Track referral earnings, wallet credits, subscription savings, discount usage, commissions, and projected earnings. Suggest upgrade timing, credit utilization strategies, and referral opportunities. Think like a personal financial advisor for executive benefits.',
  security_ai: 'You are the Security AI Agent within EXECLEAD.AI. Monitor for suspicious logins, identity fraud, credential abuse, impossible travel, account takeover, and high-risk activity. Recommend security actions like password resets, MFA, identity verification, and security reviews. Be vigilant and proactive about protecting the executive\'s account.',
};

const AGENT_TIERS = {
  executive_chief_of_staff: 'free', career_ai: 'free', executive_coach: 'professional',
  interview_ai: 'professional', board_advisor: 'executive', leadership_dna_ai: 'professional',
  learning_ai: 'professional', networking_ai: 'executive', marketplace_ai: 'executive',
  recruiter_ai: 'enterprise', founder_ai: 'founding', wallet_ai: 'free', security_ai: 'free',
};

const ALL_AGENT_IDS = Object.keys(AGENT_PROMPTS);
const TIER_LEVELS = { free: 0, professional: 1, executive: 2, founding: 3, enterprise: 2 };

function isAgentUnlocked(agentId, { plan, isFounding, isEnterprise }) {
  if (agentId === 'founder_ai') return isFounding;
  if (agentId === 'recruiter_ai') return isEnterprise || isFounding;
  const planLevel = isFounding ? 3 : (TIER_LEVELS[plan] ?? 0);
  return planLevel >= TIER_LEVELS[AGENT_TIERS[agentId]];
}

async function getUserPlan(base44, userId) {
  let plan = 'free';
  let isFounding = false;
  let isEnterprise = false;
  try {
    const founding = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: userId });
    if (founding.some(f => ['active', 'verified', 'lifetime'].includes(f.status))) isFounding = true;
  } catch (e) {}
  try {
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: userId });
    const active = subs.find(s => s.status === 'active');
    if (active) {
      const p = (active.plan || active.plan_id || '').toLowerCase();
      if (p.includes('enterprise')) { plan = 'enterprise'; isEnterprise = true; }
      else if (p.includes('executive')) plan = 'executive';
      else if (p.includes('professional')) plan = 'professional';
    }
  } catch (e) {}
  return { plan, isFounding, isEnterprise };
}

function trimRecord(record, maxLen = 600) {
  if (!record) return '';
  const { id, created_date, updated_date, created_by_id, ...rest } = record;
  return JSON.stringify(rest).substring(0, maxLen);
}

async function gatherContext(base44, user) {
  const uid = user.id;
  const sections = [`Executive: ${user.full_name || user.email}`, `Email: ${user.email}`];

  const fetchers = [
    async () => {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: uid });
      if (profiles[0]) sections.push(`\n## Executive Profile\n${trimRecord(profiles[0], 700)}`);
    },
    async () => {
      const dna = await base44.asServiceRole.entities.LeadershipDNA.filter({ user_id: uid });
      if (dna[0]) sections.push(`\n## Leadership DNA\n${trimRecord(dna[0], 500)}`);
    },
    async () => {
      const resumes = await base44.asServiceRole.entities.CareerResume.filter({ user_id: uid }, '-created_date', 1);
      if (resumes[0]) sections.push(`\n## Latest Resume\n${trimRecord(resumes[0], 600)}`);
    },
    async () => {
      const entries = await base44.asServiceRole.entities.JournalEntry.filter({ user_id: uid }, '-created_date', 3);
      if (entries.length > 0) sections.push(`\n## Recent Journal Entries\n${entries.map(e => `- ${trimRecord(e, 200)}`).join('\n')}`);
    },
    async () => {
      const wallet = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: uid });
      if (wallet[0]) sections.push(`\n## Executive Wallet\n${trimRecord(wallet[0], 300)}`);
    },
    async () => {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: uid });
      const active = subs.find(s => s.status === 'active');
      if (active) sections.push(`\n## Subscription\nPlan: ${active.plan || active.plan_id || 'unknown'}, Status: active`);
    },
    async () => {
      const sims = await base44.asServiceRole.entities.SimulationSession.filter({ user_id: uid }, '-created_date', 3);
      if (sims.length > 0) sections.push(`\n## Recent Simulations\n${sims.map(s => `- ${trimRecord(s, 150)}`).join('\n')}`);
    },
    async () => {
      const challenges = await base44.asServiceRole.entities.ChallengeResult.filter({ user_id: uid }, '-created_date', 3);
      if (challenges.length > 0) sections.push(`\n## Recent Challenge Results\n${challenges.map(c => `- ${trimRecord(c, 150)}`).join('\n')}`);
    },
    async () => {
      const certs = await base44.asServiceRole.entities.Certificate.filter({ user_id: uid });
      if (certs.length > 0) sections.push(`\n## Certificates\n${certs.length} certificate(s) earned. Latest: ${trimRecord(certs[0], 200)}`);
    },
    async () => {
      const events = await base44.asServiceRole.entities.EventRegistration.filter({ user_id: uid, status: 'confirmed' });
      if (events.length > 0) sections.push(`\n## Upcoming Events\n${events.length} registered event(s). Latest: ${trimRecord(events[0], 200)}`);
    },
    async () => {
      const mem = await base44.asServiceRole.entities.ExecutiveMemory.filter({ user_id: uid });
      if (mem[0]) sections.push(`\n## Executive Memory\n${trimRecord(mem[0], 500)}`);
    },
  ];

  const results = await Promise.allSettled(fetchers.map(f => f()));
  return sections.join('\n');
}

async function ensureAgentStates(base44, user, planInfo) {
  const existing = await base44.asServiceRole.entities.AIAgentState.filter({ user_id: user.id });
  const existingIds = new Set(existing.map(s => s.agent_id));
  const toCreate = [];
  for (const agentId of ALL_AGENT_IDS) {
    if (!existingIds.has(agentId)) {
      toCreate.push({
        user_id: user.id, agent_id: agentId,
        is_enabled: true, is_unlocked: isAgentUnlocked(agentId, planInfo),
        tasks_completed: 0, tasks_running: 0, performance_rating: 0,
      });
    } else {
      const state = existing.find(s => s.agent_id === agentId);
      const shouldUnlock = isAgentUnlocked(agentId, planInfo);
      if (state.is_unlocked !== shouldUnlock) {
        await base44.asServiceRole.entities.AIAgentState.update(state.id, { is_unlocked: shouldUnlock });
      }
    }
  }
  if (toCreate.length > 0) {
    await base44.asServiceRole.entities.AIAgentState.bulkCreate(toCreate);
  }
  return await base44.asServiceRole.entities.AIAgentState.filter({ user_id: user.id });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const planInfo = await getUserPlan(base44, user.id);

    // ── GET STATE ──
    if (action === 'get_state') {
      const agentStates = await ensureAgentStates(base44, user, planInfo);
      const recentTasks = await base44.asServiceRole.entities.AITask.filter({ user_id: user.id }, '-created_date', 20);
      const mem = await base44.asServiceRole.entities.ExecutiveMemory.filter({ user_id: user.id });
      const memory = mem[0] || null;

      const runningTasks = recentTasks.filter(t => t.status === 'running' || t.status === 'pending').length;
      const completedTasks = recentTasks.filter(t => t.status === 'completed').length;

      return Response.json({
        agents: agentStates.map(s => ({
          agent_id: s.agent_id, is_enabled: s.is_enabled, is_unlocked: s.is_unlocked,
          tasks_completed: s.tasks_completed || 0, last_task_at: s.last_task_at,
          performance_rating: s.performance_rating || 0,
        })),
        plan: planInfo,
        stats: {
          total_agents: ALL_AGENT_IDS.length,
          active_agents: agentStates.filter(s => s.is_enabled && s.is_unlocked).length,
          running_tasks: runningTasks,
          completed_tasks: completedTasks,
        },
        recent_tasks: recentTasks.slice(0, 10),
        memory,
      });
    }

    // ── TOGGLE AGENT ──
    if (action === 'toggle_agent') {
      const { agent_id, enabled } = body;
      if (!ALL_AGENT_IDS.includes(agent_id)) return Response.json({ error: 'Invalid agent' }, { status: 400 });
      const states = await base44.asServiceRole.entities.AIAgentState.filter({ user_id: user.id, agent_id });
      if (states.length === 0) return Response.json({ error: 'Agent state not found' }, { status: 404 });
      await base44.asServiceRole.entities.AIAgentState.update(states[0].id, { is_enabled: enabled, last_active: new Date().toISOString() });
      return Response.json({ success: true, agent_id, is_enabled: enabled });
    }

    // ── DAILY BRIEFING ──
    if (action === 'daily_briefing') {
      const { force } = body;
      const mem = await base44.asServiceRole.entities.ExecutiveMemory.filter({ user_id: user.id });
      const memory = mem[0];

      if (!force && memory?.last_briefing_json && memory?.last_briefing_at) {
        const briefingDate = new Date(memory.last_briefing_at).toDateString();
        if (briefingDate === new Date().toDateString()) {
          return Response.json({ briefing: JSON.parse(memory.last_briefing_json), cached: true });
        }
      }

      const context = await gatherContext(base44, user);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${AGENT_PROMPTS.executive_chief_of_staff}\n\nYou are generating the Daily Executive Briefing for this executive. Based on their profile, activity, and context below, provide a comprehensive morning briefing.\n\n=== EXECUTIVE CONTEXT ===\n${context}\n\nGenerate a structured daily briefing with: today's priorities, upcoming interviews/meetings, networking opportunities, learning recommendations, pending referrals, wallet balance summary, executive ranking note, upcoming events, and action items. Be specific and actionable.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            priorities: { type: 'array', items: { type: 'string' } },
            upcoming: { type: 'array', items: { type: 'string' } },
            networking: { type: 'array', items: { type: 'string' } },
            learning: { type: 'array', items: { type: 'string' } },
            referrals: { type: 'string' },
            wallet: { type: 'string' },
            ranking: { type: 'string' },
            events: { type: 'array', items: { type: 'string' } },
            action_items: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      const briefingJson = JSON.stringify(result);
      if (memory) {
        await base44.asServiceRole.entities.ExecutiveMemory.update(memory.id, {
          last_briefing_json: briefingJson, last_briefing_at: new Date().toISOString(),
        });
      } else {
        await base44.asServiceRole.entities.ExecutiveMemory.create({
          user_id: user.id, last_briefing_json: briefingJson, last_briefing_at: new Date().toISOString(),
        });
      }

      return Response.json({ briefing: result, cached: false });
    }

    // ── EXECUTE TASK ──
    if (action === 'execute_task') {
      const { agent_id, description } = body;
      if (!ALL_AGENT_IDS.includes(agent_id)) return Response.json({ error: 'Invalid agent' }, { status: 400 });
      if (!description) return Response.json({ error: 'Task description required' }, { status: 400 });
      if (!isAgentUnlocked(agent_id, planInfo)) {
        return Response.json({ error: 'This agent requires a higher subscription tier' }, { status: 403 });
      }

      const task = await base44.asServiceRole.entities.AITask.create({
        user_id: user.id, user_name: user.full_name || user.email,
        agent_id, task_type: 'autonomous', description, status: 'running', model: 'automatic',
      });

      try {
        const context = await gatherContext(base44, user);
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `${AGENT_PROMPTS[agent_id]}\n\n=== EXECUTIVE CONTEXT ===\n${context}\n\n=== TASK ===\nThe executive has assigned you this task:\n"${description}"\n\nComplete this task thoroughly. Provide a detailed, actionable, well-structured response in markdown format.`,
          model: 'gpt_5_mini',
        });

        await base44.asServiceRole.entities.AITask.update(task.id, {
          status: 'completed', result: typeof result === 'string' ? result : JSON.stringify(result),
          completed_at: new Date().toISOString(), context_summary: context.substring(0, 1000),
        });

        const states = await base44.asServiceRole.entities.AIAgentState.filter({ user_id: user.id, agent_id });
        if (states[0]) {
          await base44.asServiceRole.entities.AIAgentState.update(states[0].id, {
            tasks_completed: (states[0].tasks_completed || 0) + 1,
            last_task_at: new Date().toISOString(), last_active: new Date().toISOString(),
          });
        }

        return Response.json({
          task_id: task.id, status: 'completed',
          result: typeof result === 'string' ? result : JSON.stringify(result),
        });
      } catch (error) {
        await base44.asServiceRole.entities.AITask.update(task.id, { status: 'failed', error: error.message });
        return Response.json({ error: error.message, task_id: task.id, status: 'failed' }, { status: 500 });
      }
    }

    // ── RECOMMENDATIONS ──
    if (action === 'get_recommendations') {
      const context = await gatherContext(base44, user);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the AI Executive Operating System coordinator for EXECLEAD.AI. Based on this executive's profile and context, generate 5 high-impact recommendations across different AI agent domains. Each recommendation must reference exactly one of these agent_id values: ${ALL_AGENT_IDS.join(', ')}.\n\n=== EXECUTIVE CONTEXT ===\n${context}\n\nProvide 5 specific, actionable recommendations prioritized by impact. Use ONLY the agent_id values listed above — no other values are valid.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent_id: { type: 'string', enum: ALL_AGENT_IDS },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                },
              },
            },
          },
        },
      });
      return Response.json({ recommendations: result.recommendations || [] });
    }

    // ── SAVE MEMORY NOTE ──
    if (action === 'save_memory_note') {
      const { category, content } = body;
      if (!content) return Response.json({ error: 'Content required' }, { status: 400 });
      const mem = await base44.asServiceRole.entities.ExecutiveMemory.filter({ user_id: user.id });
      const memory = mem[0];
      const notes = memory?.notes_json ? JSON.parse(memory.notes_json) : [];
      notes.push({ category: category || 'general', content, created_at: new Date().toISOString() });
      if (memory) {
        await base44.asServiceRole.entities.ExecutiveMemory.update(memory.id, { notes_json: JSON.stringify(notes) });
      } else {
        await base44.asServiceRole.entities.ExecutiveMemory.create({ user_id: user.id, notes_json: JSON.stringify(notes) });
      }
      return Response.json({ success: true });
    }

    // ── GET TASKS ──
    if (action === 'get_tasks') {
      const tasks = await base44.asServiceRole.entities.AITask.filter({ user_id: user.id }, '-created_date', 50);
      return Response.json({ tasks });
    }

    // ── GET TASK DETAIL ──
    if (action === 'get_task') {
      const { task_id } = body;
      const tasks = await base44.asServiceRole.entities.AITask.filter({ id: task_id, user_id: user.id });
      return Response.json({ task: tasks[0] || null });
    }

    // ── GET PLATFORM STATE (Admin/Developer only — no personal user data) ──
    if (action === 'get_platform_state') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — platform access required' }, { status: 403 });
      }

      // Aggregate agent states across ALL users (platform-wide health)
      const allAgentStates = await base44.asServiceRole.entities.AIAgentState.filter({}, '-created_date', 500);
      const agentHealth = ALL_AGENT_IDS.map(agentId => {
        const states = allAgentStates.filter(s => s.agent_id === agentId);
        return {
          agent_id: agentId,
          total_users: states.length,
          enabled_count: states.filter(s => s.is_enabled).length,
          unlocked_count: states.filter(s => s.is_unlocked).length,
          total_tasks_completed: states.reduce((sum, s) => sum + (s.tasks_completed || 0), 0),
          avg_performance: states.length > 0
            ? Math.round(states.reduce((sum, s) => sum + (s.performance_rating || 0), 0) / states.length)
            : 0,
        };
      });

      // Aggregate task stats across ALL users (queue status — last 200 tasks)
      const recentTasks = await base44.asServiceRole.entities.AITask.filter({}, '-created_date', 200);
      const taskStats = {
        running: recentTasks.filter(t => t.status === 'running').length,
        pending: recentTasks.filter(t => t.status === 'pending').length,
        completed: recentTasks.filter(t => t.status === 'completed').length,
        failed: recentTasks.filter(t => t.status === 'failed').length,
        total: recentTasks.length,
      };

      // Model distribution across recent tasks
      const modelCounts = {};
      recentTasks.forEach(t => {
        const m = t.model || 'automatic';
        modelCounts[m] = (modelCounts[m] || 0) + 1;
      });

      // Sanitize recent tasks — strip ALL personal user data
      const sanitizedTasks = recentTasks.slice(0, 25).map(t => ({
        id: t.id,
        agent_id: t.agent_id,
        task_type: t.task_type,
        status: t.status,
        model: t.model || 'automatic',
        created_date: t.created_date,
        completed_at: t.completed_at,
        description_preview: (t.description || '').substring(0, 80),
        has_error: !!t.error,
      }));

      return Response.json({
        agents: agentHealth,
        task_stats: taskStats,
        recent_tasks: sanitizedTasks,
        model_distribution: modelCounts,
        total_agent_types: ALL_AGENT_IDS.length,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});