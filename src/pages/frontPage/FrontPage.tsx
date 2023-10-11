import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import React, {useEffect, useState} from "react";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {currencyConverter, getCurrencies} from "../../currencies/CurrencyConverter";
import OverviewTable from "./OverviewTable";
import {BrandTable} from "../brandPage/BrandTable";
import AddBrand from "../../forms/AddBrand";
import {Tabs} from "../../routing/Tabs";

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


const columnHelper = createColumnHelper<{brand:Brand,orderTotal:number,budgetTotal:number,reorderTotal:number, reorderBudgetTotal:number}>();

function FrontPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reorders, setReorders] = useState<Order[]>([]);
    const [budgets, setBudgets] = useState<Order[]>([]);
    const [reorderBudgets, setReorderBudgets] = useState<Order[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(-1);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("EUR");
    const [conversions, setConversions] = useState<{[key:string]:number}>({});
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
    const [data, setData] = useState<{brand:Brand,orderTotal:number,budgetTotal:number,reorderTotal:number, reorderBudgetTotal:number}[]>([]);
    const [top5Customers, setTop5Customers] = useState<{customer: Customer, commission: number}[]>([]);
    const tabs = ["Pre-Orders", "Re-Orders"];
    const [selectedTab, setSelectedTab] = useState<string>("Pre-Orders");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Pre-Orders"){
            setReactComp(<OverviewTable table={tablePreOrder}/>);
        } else if(selectedTab === "Re-Orders"){
            setReactComp(<OverviewTable table={tableReOrder}/>);
        }}, [selectedTab,data]
    );

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
        async function getCurrenciesInformation(){
            setAvailableCurrencies(await getCurrencies());
        }
        if(auth.currentUser){
            getBrands().then(getCurrenciesInformation);
            getSeasons();
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                getBrands().then(getCurrenciesInformation);
                getSeasons();
            }
        });


    }, []);
    useEffect(() => {
        async function getConv(){
            setConversions( (await currencyConverter(selectedCurrency,brands.map((brand)=>brand.currency))).data);
        }
        getConv();
    }, [selectedCurrency]);

    useEffect(() => {
        async function getOrders() {
            if(selectedSeason!=-1) {
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
                setOrders(orders.filter((order) => order.type === "prebook"));
                setReorders(orders.filter((order) => order.type === "reorder"));

                // top 5 customers by order amount
                const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
                const customerData = await getDocs(customerQuery);
                const customers: Customer[] = customerData.docs.map((doc) => {
                    return {
                        name: doc.data().name,
                        address: doc.data().address,
                        city: doc.data().city,
                        country: doc.data().country,
                        brands: doc.data().brands,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as Customer
                });
                const top5Customers : {customer: Customer, commission: number}[] = [];
                customers.forEach((customer) => {
                    let commission = 0;
                    orders.forEach((order) => {
                        if(order.customer.id === customer.id){

                            const currency = brands.find((brand) => brand.id === order.brand.id)?.currency;
                            const conversion = conversions[currency||"EUR"];
                            const brand = brands.find((brand) => brand.id === order.brand.id);
                            if(brand){
                                commission += order.amount * brand.commission*0.01 / conversion;
                            }
                        }
                    });
                    top5Customers.push({customer: customer, commission: commission});
                });
                top5Customers.sort((a,b) => {
                    return b.commission - a.commission;
                });
                setTop5Customers(top5Customers.slice(0,5));

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
                setBudgets(budgets.filter((budget) => budget.type === "prebook"));
                setReorderBudgets(budgets.filter((budget) => budget.type === "reorder"));
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
                const data : {brand:Brand,orderTotal:number,budgetTotal:number,reorderTotal:number, reorderBudgetTotal:number}[] = [];
                for(let i = 0; i < brands.length; i++){
                    const brand = brands[i];
                    const orderTotal = orders.filter((order) => order.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    const budgetTotal = budgets.filter((budget) => budget.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    const reorderTotal = reorders.filter((order) => order.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    const reorderBudgetTotal = reorderBudgets.filter((budget) => budget.brand.id === brand.id).reduce((a,b) => a + b.amount, 0);
                    data.push({brand:brand,orderTotal:orderTotal,budgetTotal:budgetTotal, reorderTotal:reorderTotal, reorderBudgetTotal:reorderBudgetTotal});
                }
                setData(data);
            }
            putData();
        },[orders,budgets]);



    const columnsPreOrder  = [
        columnHelper.accessor("brand", {
            header: "Brand",
            cell: (info) => info.getValue().name,
            footer: "TOTAL",
            id: "brand"
        }),
        columnHelper.accessor("budgetTotal", {
            header: "Budget",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.budgetTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budget"
        }),
        columnHelper.accessor("orderTotal", {
            header: "Orders",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.orderTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "orders"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => (info.row.original.orderTotal - info.row.original.budgetTotal).toLocaleString(),
            footer: data.reduce((a,b) => a + (b.orderTotal - b.budgetTotal)/conversions[b.brand.currency], 0).toLocaleString(),
            id: "difference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => (((info.row.original.orderTotal - info.row.original.budgetTotal)/info.row.original.budgetTotal*100)|0).toLocaleString()+"%",
            footer: ((data.reduce((a,b) => a + (b.orderTotal - b.budgetTotal)/conversions[b.brand.currency], 0)/data.reduce((a,b) => a + b.budgetTotal/conversions[b.brand.currency], 0)*100)|0).toLocaleString()+"%",
            id: "differencePercent"
        }),
        columnHelper.accessor("brand", {
            header: "Currency",
            cell: (info) => info.getValue().currency,
            footer: selectedCurrency,
            id: "currency"
        }),
        columnHelper.accessor("brand", {
            header: "Commission",
            cell: (info) => info.getValue().commission+"%",
            footer: "",
            id: "commission"
        }),
        columnHelper.accessor("brand", {
            header: "Budgeted Commission",
            cell: (info) => (info.getValue().commission * info.row.original.budgetTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budgetCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Expected Commission",
            cell: (info) => (info.getValue().commission * info.row.original.orderTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "expCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => ((info.getValue().commission * info.row.original.orderTotal*0.01) - (info.getValue().commission * info.row.original.budgetTotal*0.01)).toLocaleString(),
            footer: info => (data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)).toLocaleString(),
            id: "commissionDifference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => ((((info.getValue().commission * info.row.original.orderTotal*0.01) - (info.getValue().commission * info.row.original.budgetTotal*0.01))/(info.getValue().commission * info.row.original.budgetTotal*0.01)*100)|0).toLocaleString()+"%",
            footer: info => ((((data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0))/(data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)))*100)|0).toLocaleString()+"%",
            id: "commissionDifferencePercent"
        })
    ];

    const columnsReOrder  = [
        columnHelper.accessor("brand", {
            header: "Brand",
            cell: (info) => info.getValue().name,
            footer: "TOTAL",
            id: "brand"
        }),
        columnHelper.accessor("reorderBudgetTotal", {
            header: "Budget",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.reorderBudgetTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budget"
        }),
        columnHelper.accessor("reorderTotal", {
            header: "Orders",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.reorderTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "orders"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => (info.row.original.reorderTotal - info.row.original.reorderBudgetTotal).toLocaleString(),
            footer: data.reduce((a,b) => a + (b.reorderTotal - b.reorderBudgetTotal)/conversions[b.brand.currency], 0).toLocaleString(),
            id: "difference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => (((info.row.original.reorderTotal - info.row.original.reorderBudgetTotal)/info.row.original.reorderBudgetTotal*100)|0).toLocaleString()+"%",
            footer: ((data.reduce((a,b) => a + (b.reorderTotal - b.reorderBudgetTotal)/conversions[b.brand.currency], 0)/data.reduce((a,b) => a + b.reorderBudgetTotal/conversions[b.brand.currency], 0)*100)|0).toLocaleString()+"%",
            id: "differencePercent"
        }),
        columnHelper.accessor("brand", {
            header: "Currency",
            cell: (info) => info.getValue().currency,
            footer: selectedCurrency,
            id: "currency"
        }),
        columnHelper.accessor("brand", {
            header: "Commission",
            cell: (info) => info.getValue().commission+"%",
            footer: "",
            id: "commission"
        }),
        columnHelper.accessor("brand", {
            header: "Budgeted Commission",
            cell: (info) => (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budgetCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Expected Commission",
            cell: (info) => (info.getValue().commission * info.row.original.reorderTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "expCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => ((info.getValue().commission * info.row.original.reorderTotal*0.01) - (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01)).toLocaleString(),
            footer: info => (data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)).toLocaleString(),
            id: "commissionDifference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => ((((info.getValue().commission * info.row.original.reorderTotal*0.01) - (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01))/(info.getValue().commission * info.row.original.reorderBudgetTotal*0.01)*100)|0).toLocaleString()+"%",
            footer: info => ((((data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0))/(data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)))*100)|0).toLocaleString()+"%",
            id: "commissionDifferencePercent"
        })
    ];


    const tablePreOrder = useReactTable(
        {
            columns: columnsPreOrder,
            data: data,
            getCoreRowModel: getCoreRowModel(),
        }
    );
    const tableReOrder = useReactTable(
        {
            columns: columnsReOrder,
            data: data,
            getCoreRowModel: getCoreRowModel(),
        }
    );

    function selectCurrency(event: React.ChangeEvent<HTMLSelectElement>) {
        event.preventDefault();
        setSelectedCurrency(event.target.value);
    }
    function selectSeason(event: React.ChangeEvent<HTMLSelectElement>) {
        event.preventDefault();
        const index = seasons.findIndex((season) => season.id === event.target.value);
        setSelectedSeason(index);
    }

    return (
        <div className="page">
            <Tabs setSelectedTab={setSelectedTab} selectedTab={selectedTab} tabs={tabs}/>
            <div>
            <div className="table-wrapper">
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
                    <div className="selection">
                        <label htmlFor="currency"></label>
                        <select name="currency" id="currency" onChange={selectCurrency}>
                            <option value="EUR">Currency</option>
                            {
                                availableCurrencies.map((currency) =>
                                    <option key={currency} value={currency}>{currency}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                {reactComp}
                <p>Top 5 customers by commission:</p>
                {top5Customers.map((info) =>
                    <p key={info.customer.id}>{info.customer.name} {info.commission.toLocaleString()} {selectedCurrency}</p>
                )
                }
            </div>
            </div>
        </div>
    );
}

export default FrontPage;