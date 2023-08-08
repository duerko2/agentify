import {flexRender, Table} from "@tanstack/react-table";
import React from "react";

type Brand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}

function OverviewTable({table} :  {table: Table<{brand: Brand, orderTotal: number, budgetTotal: number, reorderTotal: number, reorderBudgetTotal: number}>}){

    return(
        <table>
            <thead>
            {table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>
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
            </tr>)}
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
            </tr>)}
            </tbody>
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
        </table>
    )
}
export default OverviewTable;