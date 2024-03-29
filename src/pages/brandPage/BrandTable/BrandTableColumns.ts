import {Brand} from "../../../types/Types";
import {createColumnHelper} from "@tanstack/react-table";

export function getBrandColumns() {
    const columnHelper = createColumnHelper<Brand>();

    return [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('commission', {
            header: 'Commission',
            cell: info => info.getValue() + "%",
            footer: info => info.column.id,
        }),
        columnHelper.accessor('currency', {
            header: 'Currency',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
    ];
}