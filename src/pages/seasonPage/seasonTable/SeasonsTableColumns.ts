import {createColumnHelper} from "@tanstack/react-table";
import {Season} from "../../../types/Types";

export function getSeasonsColumns(){
    const columnHelper = createColumnHelper<Season>();

    return [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor("date", {
            header: 'Date',
            cell: info => info.getValue().getDate() + "/" + (info.getValue().getMonth() + 1) + "/" + info.getValue().getFullYear(),
            footer: info => info.column.id,
        }),

    ];
}