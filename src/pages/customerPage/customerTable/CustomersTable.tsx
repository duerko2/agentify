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
import {getAllCustomers} from "../../../services/CustomerService";
import {useAgency} from "../../../firebase/AgencyContext";



export function CustomersTable() {
    const { agency } = useAgency();
    const [data, setData] = useState<Customer[]>([]);
    const [changeCustomer, setChangeCustomer] = useState<{show:boolean,customer:Customer}>({show:false, customer:{id:"", name:"",address:"",city:"",zipCode:"", country:"", email:"",brandIds:[], customerId:"", brands:[], brandNames:[]}});

    useEffect(() => {
        async function getData() {
            const customers = await getAllCustomers(agency);
            console.log(customers);
            setData(customers ?? []);
        }

        if(auth.currentUser) {
            getData();
        }
    }, []);

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