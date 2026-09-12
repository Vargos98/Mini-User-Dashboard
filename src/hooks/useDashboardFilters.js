import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rangeToIso } from '../lib/format';

const defaults = {
  projectId: '',
  range: '30d',
  status: '',
  q: '',
  page: 1,
  sort: 'startedAt',
  order: 'desc',
};

export const useDashboardFilters = () => {
  const [params, setParams] = useSearchParams();

  const projectId = params.get('projectId') || defaults.projectId;
  const range = params.get('range') || defaults.range;
  const status = params.get('status') || defaults.status;
  const q = params.get('q') || defaults.q;
  const page = Number(params.get('page') || defaults.page);
  const sort = params.get('sort') || defaults.sort;
  const order = params.get('order') || defaults.order;

  const apiFilters = useMemo(() => {
    const { from, to } = rangeToIso(range);
    return { projectId, status, from, to };
  }, [projectId, range, status]);

  const patch = (next) => {
    const merged = { projectId, range, status, q, page, sort, order, ...next };
    const search = new URLSearchParams();

    if (merged.projectId) search.set('projectId', merged.projectId);
    if (merged.range && merged.range !== defaults.range) search.set('range', merged.range);
    if (merged.status) search.set('status', merged.status);
    if (merged.q) search.set('q', merged.q);
    if (merged.page && Number(merged.page) > 1) search.set('page', String(merged.page));
    if (merged.sort && merged.sort !== defaults.sort) search.set('sort', merged.sort);
    if (merged.order && merged.order !== defaults.order) search.set('order', merged.order);

    setParams(search, { replace: true });
  };

  return {
    projectId,
    range,
    status,
    q,
    page,
    sort,
    order,
    apiFilters,
    setProjectId: (value) => patch({ projectId: value, page: 1 }),
    setRange: (value) => patch({ range: value, page: 1 }),
    setStatus: (value) => patch({ status: value, page: 1 }),
    setQuery: (value) => patch({ q: value, page: 1 }),
    setPage: (value) => patch({ page: value }),
    setSort: (field) => {
      if (field === sort) {
        patch({ order: order === 'asc' ? 'desc' : 'asc', page: 1 });
        return;
      }
      patch({ sort: field, order: 'desc', page: 1 });
    },
  };
};
