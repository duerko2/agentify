import React, {useEffect, useState} from "react";
import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {AgentifyTable} from "../../../component/AgentifyTable";

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

const columnHelper = createColumnHelper<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}>();

export function CustomersByBrand() {
    const [selectedBrand, setSelectedBrand] = useState<Brand>();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [budgets, setBudgets] = useState<Order[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeasons, setSelectedSeasons] = useState<{firstIndex:number,lastIndex:number}>({firstIndex:0,lastIndex:0});
    const [data, setData] = useState<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}[]>([]);
    const [showDelta, setShowDelta] = useState<boolean>(false);
    const [columns, setColumns] = useState([
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => info.getValue().name,
            footer: info => info.column.id,
            id: "customer"
        }),
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
    ]);



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
                    date: doc.data().date.toDate(),
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season});
            seasons.sort((a,b) => {
                return a.date.getTime() - b.date.getTime();
            });
            setSeasons(seasons);
            setSelectedSeasons({firstIndex:0,lastIndex:seasons.length-1})
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
            }
        }
        async function getBudgets() {
            if(selectedBrand) {
                const budgetQuery = query(collection(db, "budget"), where("uid", "==", auth.currentUser?.uid), where("brand", "==", doc(db, "brand", selectedBrand.id)));
                const budgetData = await getDocs(budgetQuery);
                const budgets: Order[] = budgetData.docs.map((doc) => {
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
                setBudgets(budgets);
            }
        }
        if(auth.currentUser){
            getOrders();
            getBudgets();
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
                const customerBudgets = budgets.filter((budget) => budget.customer.id === customer.id);

                const customerSeasons = seasons.map((season) => {
                    //const season = seasons.find((season) => season.id === order.season.id);
                    const budget = customerBudgets.filter((budget) => budget.season.id === season.id).reduce((acc, curr) => acc + curr.amount, 0);
                    const order = customerOrders.filter((order) => order.season.id === season.id).reduce((acc, curr) => acc + curr.amount, 0);

                    if(budget || order) {
                        return {
                            season: season,
                            budget: budget,
                            order: order,
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

                }});
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

    }, [budgets]);

    function selectBrand(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const brand = brands.find((brand) => brand.id === target.value);
        if(brand){
            setSelectedBrand(brand);
        }
    }





    useEffect(() => {
        function changeColumns() {
            const initialColumns  = [
                columnHelper.accessor("customer", {
                    header: "Customer",
                    cell: (info) => info.getValue().name,
                    footer: info => info.column.id,
                    id: "customer"
                }),
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
            ];

            const seasonColumns = seasons.map((season) => {
                if (seasons.indexOf(season) >= selectedSeasons.firstIndex && seasons.indexOf(season) <= selectedSeasons.lastIndex) {
                    const extraColumns = [
                        columnHelper.accessor("wholeSeason", {
                            header: season.name + " Budget",
                            cell: (info) => {
                                const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                                if (seasonInfo)
                                    return parseFloat(seasonInfo.budget.toString()).toLocaleString() + " " + selectedBrand?.currency || "";
                                else return 0;
                            },
                            footer: info => info.column.id,
                            id: season.name + "Budget",
                        }),
                        columnHelper.accessor("wholeSeason", {
                            header: season.name + " Order",
                            cell: (info) => {
                                const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                                if (seasonInfo)
                                    return parseFloat(seasonInfo.order.toString()).toLocaleString() + " " + selectedBrand?.currency;
                                else return 0;
                            },
                            footer: info => info.column.id,
                            id: season.name + "Order",
                        })
                    ];
                    if(showDelta){
                        extraColumns.push(
                        columnHelper.accessor("wholeSeason", {
                            header: season.name + " Delta",
                            cell: (info) => {
                                const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                                if (seasonInfo)
                                    return parseFloat((seasonInfo.order - seasonInfo.budget).toString()).toLocaleString();
                                else return 0;
                            },
                            footer: info => info.column.id,
                            id: season.name + "diff",
                        }));
                    }
                    return extraColumns;
                } else return [];
            });

            setColumns([...initialColumns, ...seasonColumns.flat()]);

        }
        changeColumns();
    }, [selectedBrand, selectedSeasons,showDelta])



    function selectFirstSeason(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const season = seasons.find((season) => season.id === target.value);
        if(season){
            setSelectedSeasons({... selectedSeasons,firstIndex:seasons.findIndex((s) => s.id === season.id)});
        }
    }
    function selectLastSeason(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const season = seasons.find((season) => season.id === target.value);
        if(season){
            setSelectedSeasons({... selectedSeasons, lastIndex:seasons.findIndex((s) => s.id === season.id)});
        }
    }



    function clickShowDelta(event:React.FormEvent){
        event.preventDefault();
        setShowDelta(!showDelta);
    }

    const filters = [{
        name: "brand",
        value: selectedBrand?.id || "",
        onChange: selectBrand,
        opts: brands as any[],
        takeID: true
    },
    {
        name: "firstSeason",
        value: seasons.at(selectedSeasons.firstIndex)?.id || seasons.at(0)?.id || "",
        onChange: selectFirstSeason,
        opts: seasons as any[],
        takeID: true

    },
    {
        name: "secondSeason",
        value: seasons.at(selectedSeasons.lastIndex)?.id || seasons.at(seasons.length-1)?.id || "",
        onChange: selectLastSeason,
        opts: seasons as any[],
        takeID: true
    }];

    const checkBoxes = [{
        name: "showDelta",
        label: "Show Delta",
        checked: showDelta,
        onInput: clickShowDelta
    }];

    return (
        <div className="customers">
            <AgentifyTable data={data} columns={columns} title={"Customers By Brand"} filters={filters} checkboxes={checkBoxes} globalFilter={true}/>
        </div>
    );
}