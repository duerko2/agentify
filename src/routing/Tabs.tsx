import React, {Dispatch, SetStateAction, useState} from "react";
import "../styles/tabs.css"

export function Tabs(props: { setSelectedTab: Dispatch<SetStateAction<string>>, selectedTab:string, tabs: string[] }) {

    function handleClick(name: string) {
        props.setSelectedTab(name);
    }

    return (
        <div className="tabs">
            {props.tabs.map((tab) =>{
                console.log(tab);
                console.log(props.selectedTab);
                return (

                <Tab tab={tab} selected={tab===props.selectedTab} handleClick={handleClick} />

            )})}
        </div>
    );
}

function Tab(props:{ tab: string,selected:boolean, handleClick: (name: string) => void; }){

    return (
        <div className={`tab-${props.selected ? 'selected' : ''}`} key={props.tab} onClick={
            () => {
                props.handleClick(props.tab);
            }
        }>
            <p>{props.tab}</p>
        </div>
    )
}