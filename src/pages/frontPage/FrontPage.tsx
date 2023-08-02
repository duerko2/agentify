import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import React, {useEffect, useState} from "react";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {currencyConverter} from "../../currencies/CurrencyConverter";

type Order = {
    amount:number;
    brand:DocumentReference;
    customer:DocumentReference;
    season:DocumentReference;
    type:string;
    uid:string;
    id:string;
}
type Customer = {
    name:string;
    address:string;
    city:string;
    country:string;
    brands:DocumentReference[];
    uid:string;
    id:string;
}
type Brand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}
type Season = {
    name:string;
    date:Date;
    uid:string;
    id:string;
}


const columnHelper = createColumnHelper<{brand:Brand,orderTotal:number,budgetTotal:number}>();

function FrontPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [budgets, setBudgets] = useState<Order[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(-1);
    const [data, setData] = useState<{brand:Brand,orderTotal:number,budgetTotal:number}[]>([]);

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands : Brand[] = brandsData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    commission: doc.data().commission,
                    currency: doc.data().currency,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Brand});
            setBrands(brands);
        }
        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            const seasons : Season[] = seasonData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    date: doc.data().date.toDate(),
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season});
            seasons.sort((a,b) => {
                return a.date.getTime() - b.date.getTime();
            });
            setSeasons(seasons);
            setSelectedSeason(seasons.length-1);
        }
        if(auth.currentUser){
            getBrands();
            getSeasons();
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                getBrands();
                getSeasons();
            }
        });

        currencyConverter( "EUR", ["USD","CAD"]);
    }, []);

    useEffect(() => {
        async function getOrders() {
            if(selectedSeason!=-1) {
                console.log(doc(db, "season", seasons[selectedSeason].id));
                const orderQuery = query(collection(db, "order"), where("uid", "==", auth.currentUser?.uid), where("season", "==", doc(db, "season", seasons[selectedSeason].id)));
                const orderData = await getDocs(orderQuery);
                const orders: Order[] = orderData.docs.map((doc) => {
                    return {
                        amount: doc.data().amount as number,
                        brand: doc.data().brand,
                        customer: doc.data().customer,
                        season: doc.data().season,
                        type: doc.data().type,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as Order
                });
                orders.forEach((order) => {
                    console.log(order.amount);
                });
                setOrders(orders);
                const budgetQuery = query(collection(db, "budget"), where("uid", "==", auth.currentUser?.uid), where("season", "==", doc(db, "season", seasons[selectedSeason].id)));
                const budgetData = await getDocs(budgetQuery);
                const budgets: Order[] = budgetData.docs.map((doc) => {
                    return {
                        amount: doc.data().amount as number,
                        brand: doc.data().brand,
                        customer: doc.data().customer,
                        season: doc.data().season,
                        type: doc.data().type,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as Order
                });
                setBudgets(budgets);
            }
        }

        if(auth.currentUser){
            getOrders();
        }
    }, [selectedSeason]);

    useEffect(
        () => {
            function putData(){
                if(selectedSeason===-1) {
                    return;
                }
                const data : {brand:Brand,orderTotal:number,budgetTotal:number}[] = [];
                for(let i = 0; i < brands.length; i++){
                    const brand = brands[i];
                    const orderTotal = orders.filter((order) => order.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    const budgetTotal = budgets.filter((budget) => budget.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    data.push({brand:brand,orderTotal:orderTotal,budgetTotal:budgetTotal});
                }
                setData(data);
            }
            putData();
        },[orders,budgets]);

    function selectSeason(event: React.ChangeEvent<HTMLSelectElement>) {
        event.preventDefault();
        const index = seasons.findIndex((season) => season.id === event.target.value);
        setSelectedSeason(index);
    }

    const columns  = [
        columnHelper.accessor("brand", {
            header: "Brand",
            cell: (info) => info.getValue().name,
            footer: info => info.column.id,
            id: "brand"
        }),
        columnHelper.accessor("budgetTotal", {
            header: "Total Budget",
            cell: (info) => info.getValue().toLocaleString(),
            footer: info => info.column.id,
            id: "budget"
        }),
        columnHelper.accessor("orderTotal", {
            header: "Total Orders",
            cell: (info) => info.getValue().toLocaleString(),
            footer: info => info.column.id,
            id: "orders"
        }),
        columnHelper.accessor("brand", {
            header: "Currency",
            cell: (info) => info.getValue().currency,
            footer: info => info.column.id,
            id: "currency"
        }),
        columnHelper.accessor("brand", {
            header: "Commission",
            cell: (info) => info.getValue().commission+"%",
            footer: info => info.column.id,
            id: "commission"
        }),
        columnHelper.accessor("brand", {
            header: "Budgeted Commission",
            cell: (info) => (info.getValue().commission * info.row.original.budgetTotal*0.01).toLocaleString(),
            footer: info => info.column.id,
            id: "totalCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Expected Commission",
            cell: (info) => (info.getValue().commission * info.row.original.orderTotal*0.01).toLocaleString(),
            footer: info => info.column.id,
            id: "totalCommission"
        }),




        /*
        columnHelper.accessor("customer", {
            header: "City",
            cell: (info) => info.getValue().city,
            footer: info => info.column.id,
            id: "city"
        }),
        columnHelper.accessor("customer", {
            header: "Country",
            cell: (info) => info.getValue().country,
            footer: info => info.column.id,
            id: "country"
        }),
        columnHelper.accessor("wholeSeason", {
            header: "All Orders",
            cell: (info) => info.getValue().reduce((acc, curr) => parseFloat(curr.order.toString()) + parseFloat(acc.toString()),0).toLocaleString() + " " + selectedBrand?.currency,
            footer: info => info.column.id,
            id: "allOrders"
        })

         */
    ];

    const table = useReactTable(
        {
            columns: columns,
            data: data,
            getCoreRowModel: getCoreRowModel(),
        }
    );

    return (
        <div>
            <div className="selection-wrapper">
                <div className="selection">
                    <label htmlFor="season"></label>
                    <select name="season" id="season" onChange={selectSeason}>
                        <option value="">Season</option>
                        {
                            seasons.map((season) =>
                                <option key={season.id} value={season.id}>{season.name}</option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="table-wrapper">
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
                </table>
            </div>
        </div>
    );
}

export default FrontPage;