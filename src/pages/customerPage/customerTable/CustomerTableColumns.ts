import {createColumnHelper} from "@tanstack/react-table";
import {Customer, CustomerBrand} from "../../../types/Types";

export function getCustomerColumns() {
    const columnHelper = createColumnHelper<Customer>();

    return [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
            size:250,
        }),
        columnHelper.accessor('address', {
            header: 'Address',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('city', {
            header: 'City',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('country', {
            header: 'Country',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('brands', {
            header: 'Brands',
            cell: info => info.getValue()?.map((brand: CustomerBrand) => brand.name).join(", "),
            footer: info => info.column.id,
            size:2500,
        }),
    ];
}