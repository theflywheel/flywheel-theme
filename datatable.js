// datatable: a flywheel-themed data table powered by @tanstack/table-core
// (headless engine — sorting, global filter, pagination), styled with the
// .fw-datatable classes in flywheel.css. Zero build: table-core is vendored as
// an ES module next to this file, so this loads as <script type="module">.
//
// Programmatic:
//   import { fwDataTable } from './datatable.js'
//   fwDataTable('#el', {
//     columns: [{ accessorKey:'name', header:'Name' }, 'role', ...],  // string = accessorKey+header
//     data: [{ name:'…', role:'…' }, …],
//     pageSize: 10,          // default 10; paging hidden when rows <= pageSize
//     filter: true,          // global text filter (default true)
//   })
//
// Declarative (auto-init on load): give an element data-fw-table and an inline
// JSON config, and this renders into it:
//   <div data-fw-table><script type="application/json">
//     { "columns":["name","role"], "data":[…], "pageSize":10 }
//   </script></div>

import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from './vendor/table-core.mjs';

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function apply(updater, prev) {
  return typeof updater === 'function' ? updater(prev) : updater;
}
function headerLabel(col) {
  var h = col.columnDef.header;
  return typeof h === 'string' ? h : col.id;
}

export function fwDataTable(target, opts) {
  var el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el || !opts) return null;

  var columns = (opts.columns || []).map(function (c) {
    return typeof c === 'string' ? { accessorKey: c, header: c } : c;
  });
  var data = opts.data || [];
  var pageSize = opts.pageSize || 10;
  var wantFilter = opts.filter !== false;
  var wantPager = data.length > pageSize;

  // table-core is FULLY controlled: getState() returns options.state verbatim
  // (no merge with defaults), so options.state must carry every state slice, and
  // onStateChange hands us one updater for the whole state. We seed from
  // table.initialState (all feature defaults) and route every change through here.
  var tableState;
  var table = createTable({
    data: data,
    columns: columns,
    state: {},
    onStateChange: function (updater) {
      tableState = apply(updater, tableState);
      table.setOptions(function (prev) { return Object.assign({}, prev, { state: tableState }); });
      renderTable();
    },
    renderFallbackValue: null,
    globalFilterFn: 'includesString',
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  tableState = Object.assign({}, table.initialState, {
    sorting: opts.sorting || [],
    pagination: { pageIndex: 0, pageSize: pageSize },
  });
  table.setOptions(function (prev) { return Object.assign({}, prev, { state: tableState }); });

  // Build the chrome ONCE so the filter input keeps focus across re-renders;
  // only the <table> body and the status/pager text are rebuilt on change.
  el.classList.add('fw-datatable');
  el.innerHTML =
    (wantFilter
      ? '<div class="fw-dt-bar"><input class="fw-dt-filter" type="text" placeholder="Filter…" ' +
        'aria-label="Filter table"><span class="fw-dt-count" aria-live="polite"></span></div>'
      : '') +
    '<div class="fw-dt-scroll"><table><thead></thead><tbody></tbody></table></div>' +
    (wantPager
      ? '<div class="fw-dt-pager"><button type="button" data-act="prev">prev</button>' +
        '<span class="fw-dt-page"></span>' +
        '<button type="button" data-act="next">next</button></div>'
      : '');

  var thead = el.querySelector('thead');
  var tbody = el.querySelector('tbody');
  var countEl = el.querySelector('.fw-dt-count');
  var pageEl = el.querySelector('.fw-dt-page');

  // sorting: delegate clicks on header cells
  thead.addEventListener('click', function (e) {
    var th = e.target.closest('th[data-col]');
    if (!th) return;
    var col = table.getColumn(th.getAttribute('data-col'));
    if (col && col.getCanSort()) col.toggleSorting();
  });
  var filterEl = el.querySelector('.fw-dt-filter');
  if (filterEl) filterEl.addEventListener('input', function () { table.setGlobalFilter(filterEl.value); });
  var pager = el.querySelector('.fw-dt-pager');
  if (pager) pager.addEventListener('click', function (e) {
    var act = e.target.getAttribute('data-act');
    if (act === 'prev') table.previousPage();
    else if (act === 'next') table.nextPage();
  });

  var SORT_MARK = { asc: '▲', desc: '▼' };
  function renderTable() {
    // header
    thead.innerHTML = table.getHeaderGroups().map(function (hg) {
      return '<tr>' + hg.headers.map(function (h) {
        var col = h.column;
        var sorted = col.getIsSorted(); // 'asc' | 'desc' | false
        var canSort = col.getCanSort();
        var mark = sorted ? ' <span class="fw-dt-sort">' + SORT_MARK[sorted] + '</span>' : '';
        return '<th data-col="' + esc(col.id) + '"' +
          (canSort ? ' class="fw-dt-sortable" tabindex="0" role="button"' : '') +
          (sorted ? ' aria-sort="' + (sorted === 'asc' ? 'ascending' : 'descending') + '"' : '') +
          '>' + esc(headerLabel(col)) + mark + '</th>';
      }).join('') + '</tr>';
    }).join('');

    // body
    var rows = table.getRowModel().rows;
    tbody.innerHTML = rows.length
      ? rows.map(function (row) {
          return '<tr>' + row.getVisibleCells().map(function (cell) {
            return '<td>' + esc(cell.getValue()) + '</td>';
          }).join('') + '</tr>';
        }).join('')
      : '<tr><td class="fw-dt-empty" colspan="' + columns.length + '">No matching rows</td></tr>';

    // status + pager
    var shown = table.getFilteredRowModel().rows.length;
    var total = data.length;
    if (countEl) countEl.textContent = shown === total ? total + ' rows' : shown + ' of ' + total + ' rows';
    if (pageEl) {
      var pi = table.getState().pagination.pageIndex;
      pageEl.textContent = 'page ' + (pi + 1) + ' / ' + Math.max(1, table.getPageCount());
      var prev = pager.querySelector('[data-act="prev"]');
      var next = pager.querySelector('[data-act="next"]');
      prev.disabled = !table.getCanPreviousPage();
      next.disabled = !table.getCanNextPage();
    }
  }

  renderTable();
  return table;
}

// Keyboard: Enter/Space on a focused sortable header toggles sort.
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var th = e.target.closest && e.target.closest('.fw-datatable th.fw-dt-sortable');
    if (th) { e.preventDefault(); th.click(); }
  });
}

// Auto-init declarative tables.
export function fwInitDataTables(scope) {
  (scope || document).querySelectorAll('[data-fw-table]').forEach(function (host) {
    if (host.dataset.fwReady) return;
    var cfg = host.querySelector('script[type="application/json"]');
    if (!cfg) return;
    var opts;
    try { opts = JSON.parse(cfg.textContent); } catch (err) { return; }
    host.dataset.fwReady = '1';
    fwDataTable(host, opts);
  });
}

if (typeof window !== 'undefined') {
  window.fwDataTable = fwDataTable;
  window.fwInitDataTables = fwInitDataTables;
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { fwInitDataTables(); });
  } else {
    fwInitDataTables();
  }
}
