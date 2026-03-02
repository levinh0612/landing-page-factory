import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, Bug, CalendarDays, CheckCircle2, Kanban, BarChart3,
  RefreshCw, Users, Clock, TrendingUp, AlertCircle, ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';

// ─── Shared issue types ───────────────────────────────────────────────────────

interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  phase: string;
  assignee: string | null;
  priority: string;
  type: string;
  updated: string;
  created?: string;
  browseUrl?: string | null;
}

// ─── Sprint ───────────────────────────────────────────────────────────────────

interface SprintData {
  sprint: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    state: string;
  } | null;
  issues: JiraIssue[];
}

// ─── Daily ────────────────────────────────────────────────────────────────────

interface DailyMemberReport {
  username: string;
  efficiency: 'good' | 'ok' | 'alert';
  efficiencyReason: string;
  todayCount: number;
  activeCount: number;
  overdueCount: number;
  staleCount: number;
  todayIssues: Array<{ key: string; summary: string; status: string; priority: string; updated: string; browseUrl?: string | null }>;
  activeIssues: Array<{ key: string; summary: string; status: string; phase: string; browseUrl?: string | null }>;
  overdueIssues: Array<{ key: string; summary: string; status: string; priority: string; duedate: string | null; browseUrl?: string | null }>;
}

interface DailyData {
  date: string;
  team: { totalUpdatedToday: number; totalActive: number; totalOverdue: number };
  members: DailyMemberReport[];
}

// ─── Weekly ───────────────────────────────────────────────────────────────────

interface WeeklyIssueItem {
  key: string;
  summary: string;
  status: string;
  priority: string;
  browseUrl?: string | null;
}

interface MemberReport {
  username: string;
  total: number;
  done: number;
  review: number;
  inprogress: number;
  todo: number;
  stuckCount: number;
  overdueCount: number;
  completionRate: number;
  flag: 'good' | 'ok' | 'attention' | 'no_activity';
  flagReason: string;
  comment: string;
  doneIssues: WeeklyIssueItem[];
  activeIssues: Array<WeeklyIssueItem & { stuck: boolean }>;
  todoIssues: WeeklyIssueItem[];
  overdueIssues: Array<{ key: string; summary: string; duedate: string | null; priority: string; browseUrl?: string | null }>;
}

interface WeeklyReport {
  period: string;
  generatedAt: string;
  team: {
    total: number; done: number; review: number; inprogress: number;
    todo: number; stuck: number; overdue: number; completionRate: number;
  };
  members: MemberReport[];
  highlights: { mostProductive: string | null; needsAttention: string[] };
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  Blocker:  'bg-red-600 text-white',
  Critical: 'bg-red-500 text-white',
  High:     'bg-orange-500 text-white',
  Medium:   'bg-yellow-500 text-white',
  Low:      'bg-blue-400 text-white',
  Lowest:   'bg-gray-400 text-white',
};

const STATUS_COLORS: Record<string, string> = {
  'TO DO':          'bg-gray-100 text-gray-600',
  'AWAITING SPEC':  'bg-gray-200 text-gray-700',
  'REOPENED':       'bg-orange-100 text-orange-700',
  'CONFIRMED':      'bg-sky-100 text-sky-700',
  'IN PROGRESS':    'bg-blue-100 text-blue-800',
  'IN REVIEW':      'bg-indigo-100 text-indigo-700',
  'REVIEW CODE':    'bg-violet-100 text-violet-700',
  'READY TO TEST':  'bg-purple-100 text-purple-700',
  'TESTING':        'bg-fuchsia-100 text-fuchsia-700',
  'VERIFY DONE':    'bg-teal-100 text-teal-700',
  'DONE':           'bg-green-100 text-green-800',
  'CANCELED':       'bg-red-100 text-red-600',
};

function PriorityBadge({ priority }: { priority?: string }) {
  const cls = PRIORITY_COLORS[priority ?? ''] ?? 'bg-gray-200 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {priority ?? 'N/A'}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const cls = STATUS_COLORS[status?.toUpperCase() ?? ''] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function openIssue(url?: string | null) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function IssueRow({
  issueKey, summary, url, children, className = '',
}: {
  issueKey: string;
  summary: string;
  url?: string | null;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={() => openIssue(url)}
      title={url ? `Mở ${issueKey} trên Jira` : undefined}
      className={`flex items-start gap-1.5 text-xs rounded px-1 py-0.5 transition-colors
        ${url ? 'cursor-pointer hover:bg-accent hover:text-accent-foreground group' : ''}
        ${className}`}
    >
      <span className={`font-mono shrink-0 ${url ? 'group-hover:text-blue-600 group-hover:underline' : 'text-muted-foreground'}`}>
        {issueKey}
      </span>
      <span className="flex-1 truncate">{summary}</span>
      {url && (
        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60 text-muted-foreground mt-0.5" />
      )}
      {children}
    </div>
  );
}

// ─── Flag / Efficiency styles ─────────────────────────────────────────────────

const FLAG_STYLES: Record<string, { border: string; icon: React.ReactNode; label: string }> = {
  good:        { border: 'border-l-4 border-green-400',  icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'Tốt' },
  ok:          { border: 'border-l-4 border-blue-300',   icon: <TrendingUp   className="h-4 w-4 text-blue-400" />,  label: 'OK' },
  attention:   { border: 'border-l-4 border-orange-400', icon: <AlertTriangle className="h-4 w-4 text-orange-500" />, label: 'Cần chú ý' },
  no_activity: { border: 'border-l-4 border-red-400',    icon: <AlertCircle  className="h-4 w-4 text-red-500" />,  label: 'Không activity' },
};

const EFFICIENCY_STYLES: Record<string, { border: string; badge: string; label: string; icon: React.ReactNode }> = {
  good:  { border: 'border-l-4 border-green-400',  badge: 'bg-green-100 text-green-800',  label: 'Hiệu quả',   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ok:    { border: 'border-l-4 border-blue-300',   badge: 'bg-blue-100 text-blue-800',    label: 'Bình thường', icon: <TrendingUp   className="h-3.5 w-3.5" /> },
  alert: { border: 'border-l-4 border-red-400',    badge: 'bg-red-100 text-red-700',      label: 'Báo động',   icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

// ─── Sprint columns ───────────────────────────────────────────────────────────

const SPRINT_COLS = [
  { label: 'To Do',       phase: 'todo',     bg: 'border-gray-200 bg-gray-50',     hint: 'TO DO · AWAITING SPEC · REOPENED' },
  { label: 'In Progress', phase: 'inprogress', bg: 'border-blue-200 bg-blue-50',   hint: 'CONFIRMED · IN PROGRESS · IN REVIEW' },
  { label: 'Review',      phase: 'review',   bg: 'border-violet-200 bg-violet-50', hint: 'REVIEW CODE · READY TO TEST · TESTING · VERIFY DONE' },
  { label: 'Done',        phase: 'done_all', bg: 'border-green-200 bg-green-50',   hint: 'DONE · CANCELED' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function JiraPage() {
  const [activeTab, setActiveTab] = useState('sprint');

  const sprintQuery = useQuery<SprintData>({
    queryKey: ['jira-sprint'],
    queryFn: () => api.get('/jira/sprint').then((r) => r.data.data),
    enabled: activeTab === 'sprint',
    staleTime: 2 * 60 * 1000,
  });

  const membersQuery = useQuery<Record<string, JiraIssue[]>>({
    queryKey: ['jira-members'],
    queryFn: () => api.get('/jira/members').then((r) => r.data.data),
    enabled: activeTab === 'members',
    staleTime: 2 * 60 * 1000,
  });

  const bugsQuery = useQuery<JiraIssue[]>({
    queryKey: ['jira-bugs'],
    queryFn: () => api.get('/jira/bugs').then((r) => r.data.data),
    enabled: activeTab === 'bugs',
    staleTime: 2 * 60 * 1000,
  });

  const dailyQuery = useQuery<DailyData>({
    queryKey: ['jira-daily'],
    queryFn: () => api.get('/jira/daily').then((r) => r.data.data),
    enabled: activeTab === 'daily',
    staleTime: 60 * 1000,
  });

  const weeklyQuery = useQuery<WeeklyReport>({
    queryKey: ['jira-weekly'],
    queryFn: () => api.get('/jira/weekly-report').then((r) => r.data.data),
    enabled: activeTab === 'weekly',
    staleTime: 5 * 60 * 1000,
  });

  const sprint  = sprintQuery.data;
  const members = membersQuery.data ?? {};
  const bugs    = bugsQuery.data ?? [];
  const daily   = dailyQuery.data;
  const weekly  = weeklyQuery.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Jira Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sprint board · member activity · bugs · daily · weekly report
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sprint"  className="gap-1.5"><Kanban      className="h-3.5 w-3.5" />Sprint</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5"><Users       className="h-3.5 w-3.5" />Members</TabsTrigger>
          <TabsTrigger value="bugs"    className="gap-1.5"><Bug         className="h-3.5 w-3.5" />Bugs</TabsTrigger>
          <TabsTrigger value="daily"   className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Daily</TabsTrigger>
          <TabsTrigger value="weekly"  className="gap-1.5"><BarChart3   className="h-3.5 w-3.5" />Weekly</TabsTrigger>
        </TabsList>

        {/* ─── SPRINT BOARD ─── */}
        <TabsContent value="sprint" className="mt-4">
          {sprintQuery.isLoading && <div className="py-12 text-center text-muted-foreground">Loading sprint…</div>}
          {sprintQuery.isError && <div className="py-12 text-center text-destructive text-sm">Could not load sprint data. Check JIRA_* env vars.</div>}
          {sprintQuery.isSuccess && !sprint?.sprint && <div className="py-12 text-center text-muted-foreground">No active sprint found.</div>}
          {sprintQuery.isSuccess && sprint?.sprint && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold">{sprint.sprint.name}</h2>
                <Badge variant="secondary">{sprint.issues.length} issues</Badge>
                {sprint.sprint.endDate && (
                  <span className="text-xs text-muted-foreground">Ends {format(new Date(sprint.sprint.endDate), 'MMM d, yyyy')}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {SPRINT_COLS.map((col) => {
                  const colIssues = sprint.issues.filter((i) =>
                    col.phase === 'done_all' ? i.phase === 'done' || i.phase === 'canceled' : i.phase === col.phase,
                  );
                  return (
                    <div key={col.label} className={`rounded-lg border-2 ${col.bg} p-3 min-h-[180px] space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold">{col.label}</span>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{col.hint}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">{colIssues.length}</Badge>
                      </div>
                      {colIssues.map((issue) => (
                        <div
                          key={issue.key}
                          onClick={() => openIssue(issue.browseUrl)}
                          title={issue.browseUrl ? `Mở ${issue.key} trên Jira` : undefined}
                          className={`rounded border bg-white p-2 shadow-sm text-xs space-y-1 transition-colors
                            ${issue.browseUrl ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-muted-foreground">{issue.key}</span>
                            <div className="flex items-center gap-1">
                              <PriorityBadge priority={issue.priority} />
                              {issue.browseUrl && <ExternalLink className="h-3 w-3 text-muted-foreground opacity-40" />}
                            </div>
                          </div>
                          <p className="font-medium leading-snug">{issue.summary}</p>
                          <div className="flex items-center justify-between gap-1">
                            <StatusBadge status={issue.status} />
                            {issue.assignee && <span className="text-muted-foreground truncate">{issue.assignee}</span>}
                          </div>
                        </div>
                      ))}
                      {colIssues.length === 0 && <p className="text-xs text-muted-foreground text-center pt-6">No issues</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── MEMBERS ─── */}
        <TabsContent value="members" className="mt-4">
          {membersQuery.isLoading && <div className="py-12 text-center text-muted-foreground">Loading members…</div>}
          {membersQuery.isError   && <div className="py-12 text-center text-destructive text-sm">Error loading member data.</div>}
          {membersQuery.isSuccess && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(members).map(([member, issues]) => {
                const done   = issues.filter((i) => i.phase === 'done' || i.phase === 'canceled').length;
                const review = issues.filter((i) => i.phase === 'review').length;
                const inProg = issues.filter((i) => i.phase === 'inprogress').length;
                const todo   = issues.filter((i) => i.phase === 'todo').length;
                return (
                  <Card key={member}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{member}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-xs mt-1">
                        <span className="text-green-700 font-medium">{done} done</span>
                        <span className="text-violet-700 font-medium">{review} review</span>
                        <span className="text-blue-700 font-medium">{inProg} in progress</span>
                        <span className="text-muted-foreground">{todo} to do</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {issues.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3 text-center">No activity in last 7 days</p>
                      ) : (
                        issues.map((issue) => (
                          <div
                            key={issue.key}
                            onClick={() => openIssue(issue.browseUrl)}
                            title={issue.browseUrl ? `Mở ${issue.key} trên Jira` : undefined}
                            className={`flex items-start gap-2 text-xs border-b pb-1.5 rounded px-1 -mx-1 transition-colors
                              ${issue.browseUrl ? 'cursor-pointer hover:bg-accent group' : ''}`}
                          >
                            <span className={`font-mono shrink-0 ${issue.browseUrl ? 'group-hover:text-blue-600' : 'text-muted-foreground'}`}>
                              {issue.key}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium leading-snug">{issue.summary}</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <StatusBadge status={issue.status} />
                                <PriorityBadge priority={issue.priority} />
                              </div>
                            </div>
                            {issue.browseUrl && <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50 text-muted-foreground mt-0.5" />}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── BUGS ─── */}
        <TabsContent value="bugs" className="mt-4">
          {bugsQuery.isLoading && <div className="py-12 text-center text-muted-foreground">Loading bugs…</div>}
          {bugsQuery.isError   && <div className="py-12 text-center text-destructive text-sm">Error loading bugs.</div>}
          {bugsQuery.isSuccess && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-500" />
                  Open Bugs
                  {bugs.length > 0 && <Badge variant="destructive">{bugs.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Key</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead className="w-24">Priority</TableHead>
                        <TableHead className="w-32">Assignee</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-24">Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bugs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No open bugs</TableCell>
                        </TableRow>
                      ) : (
                        bugs.map((bug) => (
                          <TableRow
                            key={bug.key}
                            onClick={() => openIssue(bug.browseUrl)}
                            title={bug.browseUrl ? `Mở ${bug.key} trên Jira` : undefined}
                            className={bug.browseUrl ? 'cursor-pointer hover:bg-accent' : ''}
                          >
                            <TableCell className="font-mono text-sm">
                              <span className="flex items-center gap-1">
                                {bug.key}
                                {bug.browseUrl && <ExternalLink className="h-3 w-3 text-muted-foreground opacity-40" />}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs"><p className="truncate">{bug.summary}</p></TableCell>
                            <TableCell><PriorityBadge priority={bug.priority} /></TableCell>
                            <TableCell className="text-sm">{bug.assignee ?? '—'}</TableCell>
                            <TableCell><StatusBadge status={bug.status} /></TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {bug.updated ? format(new Date(bug.updated), 'MMM d') : '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── DAILY ─── */}
        <TabsContent value="daily" className="mt-4">
          {dailyQuery.isLoading && <div className="py-12 text-center text-muted-foreground">Loading…</div>}
          {dailyQuery.isError   && <div className="py-12 text-center text-destructive text-sm">Error loading daily summary.</div>}
          {dailyQuery.isSuccess && daily && (
            <div className="space-y-4">
              {/* Team stats */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày {format(new Date(daily.date), 'dd/MM/yyyy')}
                </p>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => dailyQuery.refetch()}>
                  <RefreshCw className="h-3.5 w-3.5" />Refresh
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{daily.team.totalUpdatedToday}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cập nhật hôm nay</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{daily.team.totalActive}</p>
                    <p className="text-xs text-muted-foreground mt-1">Task đang xử lý</p>
                  </CardContent>
                </Card>
                <Card className={daily.team.totalOverdue > 0 ? 'border-red-300' : ''}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-3xl font-bold ${daily.team.totalOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {daily.team.totalOverdue}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Task quá hạn</p>
                  </CardContent>
                </Card>
              </div>

              {/* Per-member cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {daily.members.map((m) => {
                  const eff = EFFICIENCY_STYLES[m.efficiency];
                  return (
                    <Card key={m.username} className={eff.border}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{m.username}</CardTitle>
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${eff.badge}`}>
                            {eff.icon}{eff.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{m.efficiencyReason}</p>
                        <div className="flex flex-wrap gap-3 text-xs pt-1">
                          <span className="flex items-center gap-0.5 text-blue-700">
                            <Clock className="h-3 w-3" />{m.todayCount} hôm nay
                          </span>
                          <span className="text-muted-foreground">{m.activeCount} đang xử lý</span>
                          {m.overdueCount > 0 && (
                            <span className="text-red-600 font-medium">{m.overdueCount} quá hạn</span>
                          )}
                          {m.staleCount > 0 && (
                            <span className="text-orange-500">{m.staleCount} stuck</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        {/* Today's updates */}
                        {m.todayIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-1.5">Hôm nay ({m.todayCount})</p>
                            <div className="space-y-1.5">
                              {m.todayIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} className="border-b pb-1.5">
                                  <StatusBadge status={i.status} />
                                  <span className="text-muted-foreground shrink-0">
                                    {i.updated ? format(new Date(i.updated), 'HH:mm') : ''}
                                  </span>
                                </IssueRow>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Currently active (not in today's list) */}
                        {m.activeIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Đang xử lý ({m.activeCount})</p>
                            <div className="space-y-1">
                              {m.activeIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl}>
                                  <StatusBadge status={i.status} />
                                </IssueRow>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Overdue */}
                        {m.overdueIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-600 mb-1.5">Quá hạn ({m.overdueCount})</p>
                            <div className="space-y-1">
                              {m.overdueIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} className="bg-red-50 px-1.5 py-1">
                                  {i.duedate && (
                                    <span className="text-red-600 font-medium shrink-0">
                                      {format(new Date(i.duedate), 'dd/MM')}
                                    </span>
                                  )}
                                </IssueRow>
                              ))}
                            </div>
                          </div>
                        )}

                        {m.todayIssues.length === 0 && m.activeIssues.length === 0 && m.overdueIssues.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">Không có task nào</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── WEEKLY REPORT ─── */}
        <TabsContent value="weekly" className="mt-4">
          {weeklyQuery.isLoading && (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Đang tải dữ liệu 7 ngày…</span>
            </div>
          )}
          {weeklyQuery.isError && (
            <div className="py-12 text-center text-destructive text-sm">Lỗi load weekly report.</div>
          )}
          {weeklyQuery.isSuccess && weekly && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium">Tuần: {weekly.period}</p>
                  <p className="text-xs text-muted-foreground">
                    Generated {format(new Date(weekly.generatedAt), 'HH:mm dd/MM')}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => weeklyQuery.refetch()}>
                  <RefreshCw className="h-3.5 w-3.5" />Refresh
                </Button>
              </div>

              {/* Team summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                  { label: 'Tổng',      value: weekly.team.total,          color: 'text-foreground' },
                  { label: 'Hoàn thành', value: weekly.team.done,          color: 'text-green-700' },
                  { label: 'Review',    value: weekly.team.review,         color: 'text-violet-700' },
                  { label: 'In Progress', value: weekly.team.inprogress,   color: 'text-blue-700' },
                  { label: 'To Do',     value: weekly.team.todo,           color: 'text-muted-foreground' },
                  { label: 'Stuck',     value: weekly.team.stuck,          color: weekly.team.stuck > 0 ? 'text-orange-500' : 'text-muted-foreground' },
                  { label: 'Quá hạn',   value: weekly.team.overdue,        color: weekly.team.overdue > 0 ? 'text-red-600' : 'text-muted-foreground' },
                  { label: '% Xong',    value: `${weekly.team.completionRate}%`, color: weekly.team.completionRate >= 70 ? 'text-green-700' : 'text-orange-500' },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-3 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Highlights */}
              {(weekly.highlights.mostProductive || weekly.highlights.needsAttention.length > 0) && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 space-y-1.5 text-sm">
                    {weekly.highlights.mostProductive && (
                      <p className="text-green-700 font-medium">
                        ⭐ Năng suất nhất: <strong>{weekly.highlights.mostProductive}</strong>
                      </p>
                    )}
                    {weekly.highlights.needsAttention.length > 0 && (
                      <p className="text-orange-700">
                        ⚠️ Cần chú ý: <strong>{weekly.highlights.needsAttention.join(', ')}</strong>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Per-member cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weekly.members.map((m) => {
                  const style = FLAG_STYLES[m.flag];
                  return (
                    <Card key={m.username} className={style.border}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{m.username}</CardTitle>
                          <div className="flex items-center gap-1 text-xs">
                            {style.icon}<span>{style.label}</span>
                          </div>
                        </div>

                        {/* Auto comment */}
                        <p className="text-xs text-muted-foreground italic mt-0.5">{m.comment}</p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-2 text-xs pt-1">
                          <span className="text-green-700 font-semibold">{m.done} done ({m.completionRate}%)</span>
                          <span className="text-violet-700">{m.review} review</span>
                          <span className="text-blue-700">{m.inprogress} in progress</span>
                          {m.todo > 0 && <span className="text-muted-foreground">{m.todo} to do</span>}
                          {m.stuckCount > 0 && <span className="text-orange-500 font-medium">⚠️ {m.stuckCount} stuck</span>}
                          {m.overdueCount > 0 && <span className="text-red-600 font-medium">🚨 {m.overdueCount} quá hạn</span>}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0">
                        {/* Active issues (with stuck highlight) */}
                        {m.activeIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Đang làm</p>
                            <div className="space-y-1">
                              {m.activeIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} className={i.stuck ? 'bg-orange-50 px-1.5 py-0.5' : ''}>
                                  <StatusBadge status={i.status} />
                                  {i.stuck && <span className="text-orange-500 shrink-0 text-[10px]">stuck</span>}
                                </IssueRow>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Overdue */}
                        {m.overdueIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-1">Quá hạn ({m.overdueCount})</p>
                            <div className="space-y-1">
                              {m.overdueIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} className="bg-red-50 px-1.5 py-1">
                                  {i.duedate && (
                                    <span className="text-red-600 font-medium shrink-0">
                                      {format(new Date(i.duedate), 'dd/MM')}
                                    </span>
                                  )}
                                </IssueRow>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* To do */}
                        {m.todoIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-orange-600 mb-1">To Do ({m.todoIssues.length})</p>
                            <div className="space-y-1">
                              {m.todoIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Done */}
                        {m.doneIssues.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">Hoàn thành ({m.doneIssues.length})</p>
                            <div className="space-y-1 max-h-28 overflow-y-auto">
                              {m.doneIssues.map((i) => (
                                <IssueRow key={i.key} issueKey={i.key} summary={i.summary} url={i.browseUrl} />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
