import React, {useEffect, useState} from "react";
import {Customer, CustomerBrand} from "../../../types/Types";
import {collection, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {ChangeCustomer} from "../../../forms/ChangeCustomer";
import "../../../styles/tables.css";
import "../../../styles/overlays.css";
import {AgentifyTable} from "../../../component/AgentifyTable";
import {getCustomerColumns} from "./CustomerTableColumns";



export function CustomersTable() {
    const [data, setData] = useState<Customer[]>([]);
    const [changeCustomer, setChangeCustomer] = useState<{show:boolean,customer:Customer}>({show:false,customer: {id:"",name:"",address:"",city:"",country:"",brands:[]}});
    const brandMap = new Map<string, string>();

    useEffect(() => {
        async function getData() {
            const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
            const customerdata = await getDocs(customerQuery);
            const customers: Customer[] = customerdata.docs.map((doc) => (
                {
                    id : doc.id,
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
            setData(customers);
        };

        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            brandsData.docs.forEach((doc) => {
                brandMap.set(doc.id, doc.data().name);
            });
        }
        if(auth.currentUser) {
            getBrands().then(getData);
        }
        onAuthStateChanged(auth, (nextUser) => {
            getBrands().then(getData);
        });

    }, [changeCustomer]);

    const columns = getCustomerColumns();

    function customerClick(customer:Customer) {
        // Open a separate window with the customer details that the user can edit and save
        setChangeCustomer({show:true,customer:customer});
    }

    return (
        <div className="customers">
            <AgentifyTable
                data={data}
                columns={columns}
                title={"Customers"}
                rowClick={customerClick}
                globalFilter={true}
            />
            {changeCustomer.show &&
            <div className="changecustomer">
                <div className="opaque-overlay"/>
                <ChangeCustomer
                    customer={changeCustomer.customer}
                    setChangeCustomer={setChangeCustomer}
                />
            </div>
            }
        </div>
    );
}