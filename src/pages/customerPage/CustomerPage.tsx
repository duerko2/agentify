import React, {useEffect, useState} from "react";
import AddCustomer from "../../forms/AddCustomer";
import "../../styles/tables.css"
import {Tabs} from "../../routing/Tabs";
import {CustomersTable} from "./CustomersTable";

function CustomerPage() {
    const tabs = ["Customers", "New customer"];
    const [selectedTab, setSelectedTab] = useState<string>("Customers");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Customers"){
            setReactComp(<CustomersTable/>);
        } else if(selectedTab === "New customer"){
            setReactComp(<AddCustomer/>);
        }}, [selectedTab]
    );

    return (
        <div className="page">
            <Tabs setSelectedTab={setSelectedTab} tabs={tabs}/>
            <div>
                <h1>Customer Page</h1>
                {reactComp}
            </div>
        </div>
    );
}


export default CustomerPage;