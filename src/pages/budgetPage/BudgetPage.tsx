import React, {useEffect, useState} from "react";
import {Tabs} from "../../routing/Tabs";
import {UploadBudgets} from "./UploadBudgets";
import {AddBudget} from "./AddBudget";
import {BudgetTable} from "./budgetTable/BudgetTable";


function BudgetPage(){
    const tabs = ["Budgets", "Upload Budgets", "New Budget"];
    const [selectedTab, setSelectedTab] = useState<string>("Budgets");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Budgets"){
            setReactComp(<BudgetTable/>);
        } else if(selectedTab === "New Budget"){
            setReactComp(<AddBudget/>);
        } else if (selectedTab ==="Upload Budgets"){
            setReactComp(<UploadBudgets/>);
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

export default BudgetPage;