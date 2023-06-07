import React, {useEffect, useState} from "react";
import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";

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
export function CustomersByBrand() {
    const [selectedBrand, setSelectedBrand] = useState<Brand>();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [data, setData] = useState<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}[]>([]);


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

        async function getCustomers() {
            const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
            const customerData = await getDocs(customerQuery);
            const customers : Customer[] = customerData.docs.map((doc) => {
                return {
                    address: doc.data().address,
                    name: doc.data().name,
                    city: doc.data().city,
                    country: doc.data().country,
                    brands: doc.data().brands,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Customer});
            setCustomers(customers);
        }
        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            const seasons : Season[] = seasonData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    date: doc.data().date,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season});
            setSeasons(seasons);
        }
        if(auth.currentUser){
            getBrands();
            getCustomers();
            getSeasons();
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                getBrands();
                getCustomers();
                getSeasons();
            }
        });
    }, []);

    useEffect(() => {
        async function getOrders() {
            if(selectedBrand) {
                const orderQuery = query(collection(db, "order"), where("uid", "==", auth.currentUser?.uid), where("brand", "==", doc(db, "brand", selectedBrand.id)));
                const orderData = await getDocs(orderQuery);
                const orders: Order[] = orderData.docs.map((doc) => {
                    return {
                        amount: doc.data().amount,
                        brand: doc.data().brand,
                        customer: doc.data().customer,
                        season: doc.data().season,
                        type: doc.data().type,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as Order
                });
                setOrders(orders);
                console.log(orders);
            }
        }
        if(auth.currentUser){
            getOrders();
        }
    }, [selectedBrand]);

    useEffect(() => {
        function putData(){
            if(!selectedBrand){
                return;
            }
            const customersByBrand = customers.filter((customer) => customer.brands.find((brand) => brand.id === selectedBrand.id));
            const data = customersByBrand.map((customer) => {
                const customerOrders = orders.filter((order) => order.customer.id === customer.id);
                const customerSeasons = customerOrders.map((order) => {
                    const season = seasons.find((season) => season.id === order.season.id);
                    if(season){
                        return {
                            season: season,
                            budget: order.amount,
                            order: order.amount,
                        }
                    }
                    return {
                        season: {
                            name: "",
                            date: new Date(),
                            uid: "",
                            id: "",
                        },
                        budget: 0,
                        order: 0,
                    }
                });
                return {
                    customer: customer,
                    wholeSeason: customerSeasons,
                }
            });

            data.forEach((d)=>{
                d.wholeSeason.sort((a,b) => {
                    return b.season.date.getTime() - a.season.date.getTime();
                });
            });
            setData(data);
        }
        putData();

    }, [orders]);

    function selectBrand(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const brand = brands.find((brand) => brand.id === target.value);
        if(brand){
            setSelectedBrand(brand);
        }
    }


    const columnHelper = createColumnHelper<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}>();
    const subColumnHelper = createColumnHelper<{season:Season,budget:number,order:number}>();

    const columns = [
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => info.getValue().name,
            footer: info => info.column.id,
        }),
        columnHelper.accessor("wholeSeason", {
            header: "Whole Season",
            cell: (info) => info.getValue().reduce((acc, curr) => curr.order+acc, 0),
            footer: info => info.column.id,
        })
    ]
    const extra = seasons.map((season) => {

        return columnHelper.accessor("wholeSeason", {
            header: season.name,
            cell: (info) => {
                const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                if(seasonInfo)
                    return seasonInfo.order;
            },
            footer: info => info.column.id,
        })
    })

    columns.push(...extra);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    return (
        <div className="customers">
            <h1>Customers By Brand</h1>
            <div className="select-brand">
                <label htmlFor="brand">Select Brand</label>
                <select name="brand" id="brand" onChange={selectBrand}>
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
            </div>
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