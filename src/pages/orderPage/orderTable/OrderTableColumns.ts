import {createColumnHelper} from "@tanstack/react-table";
import {Order} from "../../../types/Types";

export function getOrderColumns(){
    const columnHelper = createColumnHelper<Order>();
    return [
        columnHelper.accessor('customer', {
            header: 'Customer',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('brand', {
            header: 'Brand',
            cell: info => info.getValue().name,
            footer: info => info.column.id,
        }),
        columnHelper.accessor('season', {
            header: 'Season',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('type', {
            header: 'Type',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('amount', {
            header: 'Amount',
            cell: info => (info.getValue()*1).toLocaleString(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('brand.currency', {
            header: 'Currency',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('brand.commission', {
            header: 'Commission',
            cell: info => (info.getValue()*info.row.original.amount*0.01).toLocaleString(),
        }),
    ];
}