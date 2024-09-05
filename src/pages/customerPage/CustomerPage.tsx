import React, {useEffect, useState} from "react";
import AddCustomer from "../../forms/addCustomerForm/AddCustomer";
import "../../styles/tables.css"
import {Tabs} from "../../routing/Tabs";
import {CustomersTable} from "./customerTable/CustomersTable";
import {CustomersByBrand} from "./CustomerByBrandTable/CustomersByBrand";

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
            <Tabs setSelectedTab={setSelectedTab} selectedTab={selectedTab} tabs={tabs}/>
            <div>
                {reactComp}
            </div>
        </div>
    );
}


export default CustomerPage;