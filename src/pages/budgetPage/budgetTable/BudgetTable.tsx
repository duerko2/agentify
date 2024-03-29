import React, {useEffect, useState} from "react";
import {Brand} from "../../../types/Types";
import {collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {getBudgetColumns} from "./BudgetTableColumns";
import {AgentifyTable} from "../../../component/AgentifyTable";




type Order = {
    amount:number;
    brand:Brand;
    customer:string;
    season:string;
    type:string;
    uid:string;
}

export function BudgetTable() {
    const [data, setData] = useState<Order[]>([]);
    const seasonMap = new Map<string, string>();
    const customerMap = new Map<string, string>();
    const brandMap = new Map<string, Brand>();


    useEffect(() => {
        async function getData() {
            const orderQuery = query(collection(db, "budget"), where("uid", "==", auth.currentUser?.uid));
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

    const columns = getBudgetColumns();

    return (
        <div className="customers">
            <AgentifyTable data={data} columns={columns} title={"Budgets"} globalFilter={true} />
        </div>
    );
}