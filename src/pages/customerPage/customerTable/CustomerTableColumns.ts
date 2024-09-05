import {createColumnHelper} from "@tanstack/react-table";
import {Customer, CustomerBrand} from "../../../types/Types";

export function getCustomerColumns() {
    const columnHelper = createColumnHelper<Customer>();

    return [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            size:250,
        }),
        columnHelper.accessor('address', {
            header: 'Address',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('city', {
            header: 'City',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('country', {
            header: 'Country',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('brandNames', {
            header: 'Brands',
            cell: info => info.getValue().map((brand: string) => brand).join(", ") ?? '',
            size:2500,
        }),
    ];
}