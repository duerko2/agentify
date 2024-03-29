import React, {useEffect, useState} from "react";
import {Tabs} from "../../routing/Tabs";
import AddBrand from "../../forms/AddBrand";
import {BrandTable} from "../brandPage/BrandTable/BrandTable";
import AddOrder from "../../forms/AddOrder";
import {OrderTable} from "./orderTable/OrderTable";
import EditableOrderTable from "./EditableOrderTable";


function BrandPage(){
    const tabs = ["Orders", "Set Orders", "New Order"];
    const [selectedTab, setSelectedTab] = useState<string>("Orders");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Orders"){
            setReactComp(<OrderTable/>);
        } else if(selectedTab === "New Order"){
            setReactComp(<AddOrder/>);
        } else if (selectedTab ==="Set Orders"){
            setReactComp(<EditableOrderTable/>);
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

export default BrandPage;