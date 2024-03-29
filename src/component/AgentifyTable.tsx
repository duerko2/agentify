import React, {useState} from "react";

import {
    ColumnDef, FilterFn,
    flexRender,
    getCoreRowModel, getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from "@tanstack/react-table";
import {
    rankItem,
} from '@tanstack/match-sorter-utils'


import {AgentifyButton} from "./AgentifyButton";


export function AgentifyTable(props: {data: any[], columns: ColumnDef<any,any>[], title: string, rowClick?: (row: any) => void, globalFilter?: boolean}) {
    const onRowClick = props.rowClick || (() => {});
    const hasGlobalFilter = props.globalFilter || false;
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [globalFilter, setGlobalFilter] = React.useState('');

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
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            globalFilter,
            pagination,
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

    return (
        <div className="table">

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <h4 style={{textAlign:"initial"}}>{props.title}</h4>
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
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} onClick={()=>onRowClick(row.original)}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
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
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
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