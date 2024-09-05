import React, {useState} from "react";

import {
    ColumnDef, FilterFn,
    flexRender,
    getCoreRowModel, getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel, SortingState,
    useReactTable
} from "@tanstack/react-table";
import {
    rankItem,
} from '@tanstack/match-sorter-utils'

import {AgentifyButton} from "./AgentifyButton";


export function AgentifyTable(
    props: {
        data: any[],
        columns: ColumnDef<any,any>[],
        title: string,
        rowClick?: (row: any) => void,
        globalFilter?: boolean,
        pagination?: boolean,
        footer?: boolean,
        filters?: {name: string, value: string | undefined, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void, opts: any[], takeID: boolean}[],
        checkboxes?: {name: string, label: string, checked: boolean, onInput: (event: React.FormEvent) => void}[],
    })
{
    const onRowClick = props.rowClick || (() => {});
    const hasGlobalFilter = props.globalFilter || false;
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    });
    const [sorting, setSorting] = React.useState<SortingState>([])
    const filters = props.filters || [];
    const checkboxes = props.checkboxes || [];
    const [globalFilter, setGlobalFilter] = React.useState('');
    const paginationEnabled = props.pagination == undefined ? true : props.pagination;
    const footerEnabled = props.footer || false
    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
        // Rank the item
        const itemRank = rankItem(row.getValue(columnId), value)

        // Store the itemRank info
        addMeta({
            itemRank,
        })

        // Return if the item should be filtered in/out
        return itemRank.passed
    }

    const table = useReactTable({
        data: props.data,
        columns: props.columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(), //provide a sorting row model
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            globalFilter,
            pagination,
            sorting,
        },
        defaultColumn: {
            minSize: 0,
            size: Number.MAX_SAFE_INTEGER,
            maxSize: Number.MAX_SAFE_INTEGER,
        },

        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getFilteredRowModel: getFilteredRowModel(),
    });
    console.log(props.data);
    console.log(props.columns);
    console.log(table.getRowModel().rows.map(row => row.original));

    return (
        <div className="table">

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <h4 style={{textAlign:"initial"}}>{props.title}</h4>

                    <div className="selection-wrapper">
                    {filters.length>0 &&
                        filters.map((filter) => (
                            <div className="selection">
                                <label htmlFor={filter.name}></label>
                                <select name={filter.name} id={filter.name} value={filter.value} onChange={filter.onChange}>
                                    {
                                        filter.opts.map((opt) =>
                                            filter.takeID ? <option key={opt.id} value={opt.id}>{opt.name}</option> : <option key={opt} value={opt}>{opt}</option>
                                        )
                                    }
                                </select>
                            </div>
                        ))
                    }
                    {checkboxes.length>0 &&
                        checkboxes.map((checkbox) => (
                            <div className="selection">
                                <label htmlFor={checkbox.name}>{checkbox.label}</label>
                                <input type="checkbox" name={checkbox.name} checked={checkbox.checked} onInput={checkbox.onInput}/>
                            </div>
                        ))
                    }
                </div>

                    {hasGlobalFilter &&
                    <DebouncedInput
                        value={globalFilter ?? ''}
                        onChange={value => setGlobalFilter(String(value))}
                        placeholder="Search"
                    />}
                </div>
                <table>
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : (<div
                                            className="table-header-cell"
                                            onClick={header.column.getToggleSortingHandler()}
                                            title={
                                                header.column.getCanSort()
                                                    ? header.column.getNextSortingOrder() === 'asc'
                                                        ? 'Sort ascending'
                                                        : header.column.getNextSortingOrder() === 'desc'
                                                            ? 'Sort descending'
                                                            : 'Clear sort'
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>)
                                        }
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getCoreRowModel().rows.map(row => (
                        <tr key={row.id} onClick={()=>onRowClick(row.original)}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                    {footerEnabled &&
                        <tfoot>
                        {table.getFooterGroups().map((footerGroup) => <tr key={footerGroup.id}>
                            {footerGroup.headers.map(header => (
                                <td key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>)}
                        </tfoot>
                    }

                </table>
            </div>
            {paginationEnabled &&
                <div className="flex items-center gap-2">
                    <AgentifyButton
                        primaryButton={false}
                        buttonText={'<<'}
                        onClick={() => table.firstPage()}
                        isDisabled={!table.getCanPreviousPage()}
                    />
                    <button
                        className="border rounded p-1"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<'}
                    </button>
                    <button
                        className="border rounded p-1"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>'}
                    </button>
                    <button
                        className="border rounded p-1"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>>'}
                    </button>
                    <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount().toLocaleString()}
              </strong>
            </span>
                    <span className="flex items-center gap-1">
              | Go to page:
              <input
                  type="number"
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      table.setPageIndex(page)
                  }}
                  className="border p-1 rounded w-16"
              />
            </span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                    >
                        {[25, 50, 75, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            }
        </div>
    );
}

// A debounced input react component
function DebouncedInput({
                            value: initialValue,
                            onChange,
                            debounce = 500,
                            ...props
                        }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <div className="search-wrapper">
            <input className="table-search" {...props} value={value} onChange={e => setValue(e.target.value)} />
        </div>
    )
}