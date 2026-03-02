import type { Request, Response, NextFunction } from 'express';

// Support both JIRA_DOMAIN (from skill .env) and JIRA_BASE_URL
const JIRA_BASE_URL = process.env.JIRA_DOMAIN || process.env.JIRA_BASE_URL;
const JIRA_PAT = process.env.JIRA_PAT;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
const JIRA_BOARD_ID = process.env.JIRA_BOARD_ID;
const DEFAULT_MEMBERS = 'cuong.lv,yen.vh1,vinh.nhl';

function getMembers(): string[] {
  return (process.env.JIRA_MEMBERS || DEFAULT_MEMBERS).split(',').map((m) => m.trim());
}

function getAuthHeader(): string {
  return `Bearer ${JIRA_PAT}`;
}

async function jiraFetch(path: string): Promise<any> {
  if (!JIRA_BASE_URL || !JIRA_PAT) {
    throw new Error('Jira not configured. Set JIRA_DOMAIN and JIRA_PAT in packages/api/.env');
  }
  const url = `${JIRA_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// Workflow phases — maps actual Jira status names → display phase
const STATUS_PHASE: Record<string, string> = {
  'TO DO':          'todo',
  'AWAITING SPEC':  'todo',
  'REOPENED':       'todo',
  'CONFIRMED':      'inprogress',
  'IN PROGRESS':    'inprogress',
  'IN REVIEW':      'inprogress',
  'REVIEW CODE':    'review',
  'READY TO TEST':  'review',
  'TESTING':        'review',
  'VERIFY DONE':    'review',
  'DONE':           'done',
  'CANCELED':       'canceled',
};

const DONE_STATUSES = ['DONE', 'CANCELED'];

function getPhase(statusName: string): string {
  return STATUS_PHASE[statusName?.toUpperCase()] ?? 'inprogress';
}

function mapIssue(i: any) {
  const statusName: string = i.fields?.status?.name ?? '';
  return {
    key: i.key,
    summary: i.fields?.summary,
    status: statusName,
    phase: getPhase(statusName),
    assignee: i.fields?.assignee?.name || i.fields?.assignee?.displayName || null,
    priority: i.fields?.priority?.name,
    type: i.fields?.issuetype?.name,
    updated: i.fields?.updated,
    created: i.fields?.created,
    browseUrl: JIRA_BASE_URL ? `${JIRA_BASE_URL}/browse/${i.key}` : null,
  };
}

function mapIssueWithDue(i: any) {
  return { ...mapIssue(i), duedate: i.fields?.duedate ?? null };
}

export async function getSprintBoard(_req: Request, res: Response, next: NextFunction) {
  try {
    let boardId = JIRA_BOARD_ID;

    if (!boardId && JIRA_PROJECT_KEY) {
      const boards = await jiraFetch(`/rest/agile/1.0/board?projectKeyOrId=${JIRA_PROJECT_KEY}&maxResults=1`);
      boardId = String(boards.values?.[0]?.id ?? '');
    }

    if (!boardId) {
      return res.status(400).json({
        success: false,
        error: 'No board found. Set JIRA_BOARD_ID or JIRA_PROJECT_KEY in .env',
      });
    }

    const sprints = await jiraFetch(`/rest/agile/1.0/board/${boardId}/sprint?state=active&maxResults=1`);
    const activeSprint = sprints.values?.[0];

    if (!activeSprint) {
      return res.json({ success: true, data: { sprint: null, issues: [] } });
    }

    const issuesData = await jiraFetch(
      `/rest/agile/1.0/sprint/${activeSprint.id}/issue?fields=summary,status,assignee,priority,issuetype,updated&maxResults=100`,
    );

    res.json({
      success: true,
      data: {
        sprint: {
          id: activeSprint.id,
          name: activeSprint.name,
          startDate: activeSprint.startDate,
          endDate: activeSprint.endDate,
          state: activeSprint.state,
        },
        issues: (issuesData.issues || []).map(mapIssue),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMemberActivity(_req: Request, res: Response, next: NextFunction) {
  try {
    const members = getMembers();
    const projectFilter = JIRA_PROJECT_KEY ? ` AND project = ${JIRA_PROJECT_KEY}` : '';
    const jql = encodeURIComponent(`assignee in (${members.join(',')})${projectFilter} AND updated >= -7d ORDER BY updated DESC`);
    const data = await jiraFetch(
      `/rest/api/2/search?jql=${jql}&fields=summary,status,assignee,updated,priority,issuetype&maxResults=200`,
    );

    const byMember: Record<string, any[]> = {};
    members.forEach((m) => {
      byMember[m] = [];
    });

    for (const issue of data.issues || []) {
      const assignee = issue.fields?.assignee?.name || issue.fields?.assignee?.displayName;
      if (assignee && byMember[assignee] !== undefined) {
        byMember[assignee].push(mapIssue(issue));
      }
    }

    res.json({ success: true, data: byMember });
  } catch (err) {
    next(err);
  }
}

export async function getBugs(_req: Request, res: Response, next: NextFunction) {
  try {
    const projectFilter = JIRA_PROJECT_KEY ? ` AND project = ${JIRA_PROJECT_KEY}` : '';
    const doneFilter = DONE_STATUSES.map((s) => `"${s}"`).join(',');
    const jql = encodeURIComponent(
      `issuetype = Bug${projectFilter} AND status not in (${doneFilter}) ORDER BY priority ASC, created DESC`,
    );
    const data = await jiraFetch(
      `/rest/api/2/search?jql=${jql}&fields=summary,status,assignee,priority,created,updated&maxResults=100`,
    );

    res.json({
      success: true,
      data: (data.issues || []).map(mapIssue),
    });
  } catch (err) {
    next(err);
  }
}

export async function getDailySummary(_req: Request, res: Response, next: NextFunction) {
  try {
    const members = getMembers();
    const memberList = members.join(',');
    const doneFilter = DONE_STATUSES.map((s) => `"${s}"`).join(',');
    const pf = JIRA_PROJECT_KEY ? ` AND project = ${JIRA_PROJECT_KEY}` : '';
    const now = new Date();
    const THREE_DAYS_AGO = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // 3 parallel queries: today's updates, all active tasks, overdue tasks
    const [todayData, activeData, overdueData] = await Promise.all([
      jiraFetch(
        `/rest/api/2/search?jql=${encodeURIComponent(`assignee in (${memberList})${pf} AND updated >= startOfDay() ORDER BY updated DESC`)}&fields=summary,status,assignee,priority,issuetype,updated&maxResults=200`,
      ),
      jiraFetch(
        `/rest/api/2/search?jql=${encodeURIComponent(`assignee in (${memberList})${pf} AND status not in (${doneFilter}) ORDER BY updated DESC`)}&fields=summary,status,assignee,priority,issuetype,updated&maxResults=300`,
      ),
      jiraFetch(
        `/rest/api/2/search?jql=${encodeURIComponent(`assignee in (${memberList})${pf} AND duedate < now() AND status not in (${doneFilter}) ORDER BY duedate ASC`)}&fields=summary,status,assignee,priority,issuetype,duedate,updated&maxResults=100`,
      ).catch(() => ({ issues: [] })),
    ]);

    type IssueWithDue = ReturnType<typeof mapIssueWithDue>;
    const todayIssues:   IssueWithDue[] = ((todayData.issues   || []) as any[]).map(mapIssueWithDue);
    const activeIssues:  IssueWithDue[] = ((activeData.issues  || []) as any[]).map(mapIssueWithDue);
    const overdueIssues: IssueWithDue[] = ((overdueData.issues || []) as any[]).map(mapIssueWithDue);

    const memberReports = members.map((username) => {
      const myToday   = todayIssues.filter((i) => i.assignee === username);
      const myActive  = activeIssues.filter((i) => i.assignee === username);
      const myOverdue = overdueIssues.filter((i) => i.assignee === username);
      const myStale   = myActive.filter((i) => i.updated && new Date(i.updated) < THREE_DAYS_AGO);

      let efficiency: 'good' | 'ok' | 'alert';
      let efficiencyReason: string;

      if (myOverdue.length > 0 || myStale.length >= 2) {
        efficiency = 'alert';
        const parts: string[] = [];
        if (myOverdue.length > 0) parts.push(`${myOverdue.length} task quá hạn`);
        if (myStale.length >= 2)  parts.push(`${myStale.length} task không update 3+ ngày`);
        efficiencyReason = parts.join(', ');
      } else if (myToday.length === 0 && myActive.length > 0) {
        efficiency = 'ok';
        efficiencyReason = 'Chưa có cập nhật hôm nay';
      } else if (myToday.length > 0) {
        efficiency = 'good';
        efficiencyReason = `Đã cập nhật ${myToday.length} task hôm nay`;
      } else {
        efficiency = 'ok';
        efficiencyReason = 'Không có task đang xử lý';
      }

      return {
        username,
        efficiency,
        efficiencyReason,
        todayCount:   myToday.length,
        activeCount:  myActive.length,
        overdueCount: myOverdue.length,
        staleCount:   myStale.length,
        todayIssues: myToday.map((i) => ({
          key: i.key, summary: i.summary, status: i.status, priority: i.priority, updated: i.updated, browseUrl: i.browseUrl,
        })),
        activeIssues: myActive.slice(0, 8).map((i) => ({
          key: i.key, summary: i.summary, status: i.status, phase: i.phase, browseUrl: i.browseUrl,
        })),
        overdueIssues: myOverdue.map((i) => ({
          key: i.key, summary: i.summary, status: i.status, priority: i.priority, duedate: i.duedate, browseUrl: i.browseUrl,
        })),
      };
    });

    res.json({
      success: true,
      data: {
        date: now.toISOString().slice(0, 10),
        team: {
          totalUpdatedToday: todayIssues.length,
          totalActive:       activeIssues.length,
          totalOverdue:      overdueIssues.length,
        },
        members: memberReports,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyReport(_req: Request, res: Response, next: NextFunction) {
  try {
    const members = getMembers();
    const memberList = members.join(',');
    const doneFilter = DONE_STATUSES.map((s) => `"${s}"`).join(',');
    const pf = JIRA_PROJECT_KEY ? ` AND project = ${JIRA_PROJECT_KEY}` : '';
    const now = new Date();
    const THREE_DAYS_AGO = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const [weeklyData, overdueData] = await Promise.all([
      jiraFetch(
        `/rest/api/2/search?jql=${encodeURIComponent(`assignee in (${memberList})${pf} AND updated >= -7d ORDER BY updated DESC`)}&fields=summary,status,assignee,priority,issuetype,updated&maxResults=500`,
      ),
      jiraFetch(
        `/rest/api/2/search?jql=${encodeURIComponent(`assignee in (${memberList})${pf} AND duedate < now() AND status not in (${doneFilter}) ORDER BY duedate ASC`)}&fields=summary,status,assignee,priority,issuetype,duedate&maxResults=100`,
      ).catch(() => ({ issues: [] })),
    ]);

    type WeeklyIssue    = ReturnType<typeof mapIssue>;
    type IssueWithDue2  = ReturnType<typeof mapIssueWithDue>;
    const allIssues:  WeeklyIssue[]   = ((weeklyData.issues  || []) as any[]).map(mapIssue);
    const overdueAll: IssueWithDue2[] = ((overdueData.issues || []) as any[]).map(mapIssueWithDue);

    const memberReports = members.map((username) => {
      const issues     = allIssues.filter((i) => i.assignee === username);
      const done       = issues.filter((i) => i.phase === 'done');
      const canceled   = issues.filter((i) => i.phase === 'canceled');
      const review     = issues.filter((i) => i.phase === 'review');
      const inprogress = issues.filter((i) => i.phase === 'inprogress');
      const todo       = issues.filter((i) => i.phase === 'todo');

      const doneCount      = done.length + canceled.length;
      const completionRate = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : 0;

      // Stuck: active/review but not updated in 3+ days
      const stuckIssues = [...review, ...inprogress].filter(
        (i) => i.updated && new Date(i.updated) < THREE_DAYS_AGO,
      );
      const myOverdue = overdueAll.filter((i) => i.assignee === username);

      let flag: 'good' | 'ok' | 'attention' | 'no_activity';
      let flagReason: string;

      if (issues.length === 0) {
        flag = 'no_activity';
        flagReason = 'Không có activity trong 7 ngày';
      } else if (myOverdue.length > 0 || stuckIssues.length >= 2) {
        flag = 'attention';
        const parts: string[] = [];
        if (myOverdue.length > 0)    parts.push(`${myOverdue.length} task quá hạn`);
        if (stuckIssues.length >= 2) parts.push(`${stuckIssues.length} task bị stuck`);
        flagReason = parts.join(', ');
      } else if (completionRate >= 60 && doneCount >= 3) {
        flag = 'good';
        flagReason = `${doneCount}/${issues.length} hoàn thành (${completionRate}%)`;
      } else {
        flag = 'ok';
        flagReason = `${doneCount}/${issues.length} hoàn thành (${completionRate}%)`;
      }

      // Auto-generated comment (no AI)
      let comment: string;
      if (issues.length === 0) {
        comment = 'Không có activity trong tuần.';
      } else if (completionRate >= 80 && doneCount >= 5) {
        comment = `Tuần xuất sắc! Hoàn thành ${doneCount}/${issues.length} task (${completionRate}%).`;
      } else if (completionRate >= 60) {
        comment = `Hoàn thành ${doneCount}/${issues.length} task (${completionRate}%).`;
      } else if (doneCount === 0) {
        comment = `Chưa hoàn thành task nào. ${inprogress.length + review.length} task đang xử lý.`;
      } else {
        comment = `Hoàn thành ${doneCount}/${issues.length} task (${completionRate}%). Cần tăng tốc.`;
      }
      if (stuckIssues.length > 0) comment += ` ⚠️ ${stuckIssues.length} task stuck 3+ ngày.`;
      if (myOverdue.length > 0)   comment += ` 🚨 ${myOverdue.length} task quá hạn.`;
      if (review.length > 0)      comment += ` ${review.length} task chờ review.`;

      const stuckKeys = new Set(stuckIssues.map((s) => s.key));

      return {
        username,
        total: issues.length,
        done: doneCount,
        review: review.length,
        inprogress: inprogress.length,
        todo: todo.length,
        stuckCount:  stuckIssues.length,
        overdueCount: myOverdue.length,
        completionRate,
        flag,
        flagReason,
        comment,
        doneIssues:   [...done, ...canceled].map((i) => ({ key: i.key, summary: i.summary, status: i.status, priority: i.priority, browseUrl: i.browseUrl })),
        activeIssues: [...review, ...inprogress].map((i) => ({ key: i.key, summary: i.summary, status: i.status, priority: i.priority, stuck: stuckKeys.has(i.key), browseUrl: i.browseUrl })),
        todoIssues:   todo.map((i) => ({ key: i.key, summary: i.summary, status: i.status, priority: i.priority, browseUrl: i.browseUrl })),
        overdueIssues: myOverdue.map((i) => ({ key: i.key, summary: i.summary, duedate: i.duedate, priority: i.priority, browseUrl: i.browseUrl })),
      };
    });

    const team = {
      total:          allIssues.length,
      done:           memberReports.reduce((s, m) => s + m.done, 0),
      review:         memberReports.reduce((s, m) => s + m.review, 0),
      inprogress:     memberReports.reduce((s, m) => s + m.inprogress, 0),
      todo:           memberReports.reduce((s, m) => s + m.todo, 0),
      stuck:          memberReports.reduce((s, m) => s + m.stuckCount, 0),
      overdue:        overdueAll.length,
      completionRate: allIssues.length > 0
        ? Math.round((memberReports.reduce((s, m) => s + m.done, 0) / allIssues.length) * 100)
        : 0,
    };

    const sorted         = [...memberReports].sort((a, b) => b.done - a.done || b.completionRate - a.completionRate);
    const mostProductive = sorted[0]?.username ?? null;
    const needsAttention = memberReports.filter((m) => m.flag === 'attention' || m.flag === 'no_activity').map((m) => m.username);

    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    const fmt    = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const period = `${fmt(from)} – ${fmt(now)}`;

    res.json({
      success: true,
      data: {
        period,
        generatedAt: now.toISOString(),
        team,
        members: memberReports,
        highlights: { mostProductive, needsAttention },
      },
    });
  } catch (err) {
    next(err);
  }
}
