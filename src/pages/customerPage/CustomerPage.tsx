import React, {useEffect, useState} from "react";
import AddCustomer from "../../forms/AddCustomer";
import "../../styles/tables.css"
import {Tabs} from "../../routing/Tabs";
import {CustomersTable} from "./CustomersTable";
import {CustomersByBrand} from "./CustomersByBrand";

function CustomerPage() {
    const tabs = ["Customers", "By Brand","New customer"];
    const [selectedTab, setSelectedTab] = useState<string>("Customers");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        switch(selectedTab){
            case "Customers":
                setReactComp(<CustomersTable/>);
                break;
            case "By Brand":
                setReactComp(<CustomersByBrand/>);
                break;
            case "New customer":
                setReactComp(<AddCustomer/>);
                break;
            default:
                setReactComp(<></>);
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