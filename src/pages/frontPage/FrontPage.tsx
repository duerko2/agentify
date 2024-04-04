import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import React, {useEffect, useState} from "react";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {currencyConverter, getCurrencies} from "../../currencies/CurrencyConverter";
import {Tabs} from "../../routing/Tabs";
import {BrandsPolarAxis} from "./BrandsPolarAxis";
import {AgentifyTable} from "../../component/AgentifyTable";
import {getPreOrderColumns, getReOrderColumns} from "./overviewTable/FrontPageTableColumns";
import OverviewTable from "./overviewTable/OverviewTable";

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
    const [pieGraphData, setPieGraphData] = useState<{budget:number,realized:number}>();
    const [top5Customers, setTop5Customers] = useState<{customer: Customer, commission: number}[]>([]);
    const tabs = ["Pre-Orders", "Re-Orders"];
    const [selectedTab, setSelectedTab] = useState<string>("Pre-Orders");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);
    const [columns, setColumns] = useState<any[]>([]);

    useEffect(() => {
        if(selectedTab === "Pre-Orders"){
            setColumns(getPreOrderColumns(data, conversions, selectedCurrency));
        } else if(selectedTab === "Re-Orders"){
            setColumns(getReOrderColumns(data, conversions, selectedCurrency));
        }}, [selectedTab,data,selectedCurrency]
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
        },[orders,budgets,selectedCurrency, selectedTab]);


    function selectCurrency(event: React.ChangeEvent<HTMLSelectElement>) {
        event.preventDefault();
        setSelectedCurrency(event.target.value);
    }
    function selectSeason(event: React.ChangeEvent<HTMLSelectElement>) {
        event.preventDefault();
        const index = seasons.findIndex((season) => season.id === event.target.value);
        setSelectedSeason(index);
    }

    const filters = [{name: "season", value: seasons.at(selectedSeason)?.id, onChange: selectSeason, opts: seasons as any[], takeID: true},{name: "currency", value: availableCurrencies.find((cur)=>selectedCurrency===cur), onChange: selectCurrency, opts: availableCurrencies as any[], takeID: false}]


    return (
        <div className="page">
            <Tabs setSelectedTab={setSelectedTab} selectedTab={selectedTab} tabs={tabs}/>


            <div className="componenets-wrapper-flex">
                <AgentifyTable data={data} columns={columns} title={"Overview"} filters={filters} pagination={false} footer={true}/>

                <div className="chart-container">
                    <p>Brand progress</p>
                    <BrandsPolarAxis data={data}/>
                </div>
                <div className="chart-container">
                    <p>Burn up chart</p>
                    <canvas id="preOrderChart" width="400" height="400"></canvas>
                </div>
                <div className="chart-container">
                    <p>Commission over seasons</p>
                    <canvas id="reOrderChart" width="400" height="400"></canvas>
                </div>

                <div className="component-wrapper">
                    <p>Top 5 customers by commission:</p>
                    {top5Customers.map((info) =>
                        <p key={info.customer.id}>{info.customer.name} {info.commission.toLocaleString()} {selectedCurrency}</p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default FrontPage;