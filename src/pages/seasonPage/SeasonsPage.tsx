import React, {useEffect, useState} from "react";
import {Tabs} from "../../routing/Tabs";
import {SeasonsTable} from "./seasonTable/SeasonsTable";

type Season = {
    name:string;
    date:Date;
    uid:string;
    id:string;
}



export function SeasonsPage() {

    const tabs = ["Seasons", "New Season"];
    const [selectedTab, setSelectedTab] = useState<string>("Seasons");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Seasons"){
            setReactComp(<SeasonsTable/>);
        } else if(selectedTab === "New Season"){
            setReactComp(<NewSeason/>);
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


function NewSeason() {

    return (
        <div>
            <h1>New Season</h1>
        </div>
    )
}