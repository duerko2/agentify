import React, {useEffect, useState} from "react";
import {Tabs} from "../../routing/Tabs";
import AddBrand from "../../forms/AddBrand";
import {BrandTable} from "./BrandTable";


function BrandPage(){
    const tabs = ["Brands", "New Brand"];
    const [selectedTab, setSelectedTab] = useState<string>("Brands");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Brands"){
            setReactComp(<BrandTable/>);
        } else if(selectedTab === "New Brand"){
            setReactComp(<AddBrand/>);
        }}, [selectedTab]
    );

    return (
        <div className="page">
            <Tabs setSelectedTab={setSelectedTab} tabs={tabs}/>
            <div>
                <h1>Brand Page</h1>
                {reactComp}
            </div>
        </div>
    );

}

export default BrandPage;