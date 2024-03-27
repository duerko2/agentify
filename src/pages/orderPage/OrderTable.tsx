import React, {useEffect, useState} from "react";
import {Brand, Customer, CustomerBrand} from "../../types/Types";
import {collection, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";


type Order = {
    amount:number;
    brand:Brand;
    customer:string;
    season:string;
    type:string;
    uid:string;
}



export function OrderTable() {
    const [data, setData] = useState<Order[]>([]);
    const seasonMap = new Map<string, string>();
    const customerMap = new Map<string, string>();
    const brandMap = new Map<string, Brand>();


    useEffect(() => {
        async function getData() {
            const orderQuery = query(collection(db, "order"), where("uid", "==", auth.currentUser?.uid));
            const orderData = await getDocs(orderQuery);
            const orders: Order[] = orderData.docs.map((doc) => (
                {
                    amount: doc.data().amount,
                    brand: brandMap.get(doc.data().brand.id),
                    customer: customerMap.get(doc.data().customer.id),
                    season: seasonMap.get(doc.data().season.id),
                    type: doc.data().type,
                    uid: doc.data().uid,
                } as Order));
            setData(orders);
        };

        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            brandsData.docs.forEach((doc) => {
                brandMap.set(doc.id,
                    {
                        name: doc.data().name,
                        commission: doc.data().commission,
                        currency: doc.data().currency,
                        uid: doc.data().uid,
                    } as Brand);
            });
        }

        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            seasonData.docs.forEach((doc) => {
                seasonMap.set(doc.id, doc.data().name);
            });
        }

        async function getCustomers() {
            const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
            const customerData = await getDocs(customerQuery);
            customerData.docs.forEach((doc) => {
                customerMap.set(doc.id, doc.data().name);
            });
        }
        if (auth.currentUser) {
            getBrands().then(getSeasons).then(getCustomers).then(getData);
        }
        onAuthStateChanged(auth, (nextUser) => {
            getBrands().then(getSeasons).then(getCustomers).then(getData);
        });

    }, []);


    const columnHelper = createColumnHelper<Order>();

    const columns = [
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
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    return (
        <div className="customers">
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