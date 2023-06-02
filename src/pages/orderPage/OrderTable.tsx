import React, {useEffect, useState} from "react";
import {Customer, CustomerBrand} from "../../types/Types";
import {collection, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";

export function OrderTable() {
    const [data, setData] = useState<Customer[]>([]);
    const brandMap = new Map<string, string>();

    useEffect(() => {
        async function getData() {
            const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
            const customerdata = await getDocs(customerQuery);
            const customers: Customer[] = customerdata.docs.map((doc) => (
                {
                    name: doc.data().name,
                    address: doc.data().address,
                    city: doc.data().city,
                    country: doc.data().country,
                    brands: doc.data().brands?.map(
                        (brand: DocumentReference) =>
                            (
                                {
                                    name: brandMap.get(brand.id),
                                    id: brand.id
                                } as CustomerBrand)),
                } as Customer));
            console.log(customers);

            setData(customers);
        };

        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            brandsData.docs.forEach((doc) => {
                brandMap.set(doc.id, doc.data().name);
            });
        }


        onAuthStateChanged(auth, (nextUser) => {
            getBrands().then(() => {
                getData();
            });
        });
        getBrands().then(() => {
            getData();
        });
    }, []);


    const columnHelper = createColumnHelper<Customer>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
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
        }),
    ];
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="customers">
            <h1>Customers</h1>
            <div className="table-wrapper">
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
                        <tr key={row.id}>
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
        </div>
    );
}