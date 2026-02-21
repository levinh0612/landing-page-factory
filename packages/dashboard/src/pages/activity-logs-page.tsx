import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/axios';
import { useDebounce } from '@/hooks/use-debounce';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/pagination-controls';

const actionBadgeVariant = (action: string) => {
  if (action.includes('created')) return 'default' as const;
  if (action.includes('updated') || action.includes('status')) return 'secondary' as const;
  if (action.includes('deleted') || action.includes('deactivated')) return 'destructive' as const;
  if (action.includes('login') || action.includes('registered')) return 'outline' as const;
  return 'outline' as const;
};

export function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit, resetPage, meta, setMeta } = usePagination();

  useEffect(() => { resetPage(); }, [debouncedSearch, entityTypeFilter, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', debouncedSearch, entityTypeFilter, page, limit],
    queryFn: async () => {
      const params: any = { page, limit };
      if (debouncedSearch) params.action = debouncedSearch;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      const res = await api.get('/activity-logs', { params });
      return res.data;
    },
  });

  useEffect(() => {
    if (data?.meta) setMeta({ total: data.meta.total, totalPages: data.meta.totalPages });
  }, [data?.meta, setMeta]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Logs</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm max-w-[180px]"
        >
          <option value="">All types</option>
          <option value="template">Template</option>
          <option value="client">Client</option>
          <option value="project">Project</option>
          <option value="user">User</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length ? (
                  data.data.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.user?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.entityType ? (
                          <Badge variant="outline">{log.entityType}</Badge>
                        ) : (
                          log.project?.name || '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {log.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            page={page}
            totalPages={meta.totalPages}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}
    </div>
  );
}
