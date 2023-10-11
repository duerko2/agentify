import React, {useEffect, useState} from "react";
import {Brand, Customer, CustomerBrand} from "../../types/Types";
import {collection, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";

export function BrandTable() {
    const [data, setData] = useState<Brand[]>([]);

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: Brand[] = brandsData.docs.map((doc) => {
                return (
                    {
                        name: doc.data().name,
                        commission: doc.data().commission,
                        currency: doc.data().currency,
                    } as Brand);
            });
            setData(brands)
            console.log(brands);
        }
        onAuthStateChanged(auth, (nextUser) => {
            getBrands();
        });

        getBrands();
    }, []);


    const columnHelper = createColumnHelper<Brand>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor('commission', {
            header: 'Commission',
            cell: info => info.getValue()+"%",
            footer: info => info.column.id,
        }),
        columnHelper.accessor('currency', {
            header: 'Currency',
            cell: info => info.getValue(),
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
            <div className="table-wrapper">
                <h1>Brands</h1>
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