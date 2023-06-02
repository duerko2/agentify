import React, {Dispatch, SetStateAction} from "react";
import "../styles/tabs.css"

export function Tabs(props: { setSelectedTab: Dispatch<SetStateAction<string>>, tabs: string[] }) {

    function handleClick(name: string) {
        props.setSelectedTab(name);
    }

    return (
        <div className="tabs">
            {props.tabs.map((tab) => (
                <div className="tab" key={tab} onClick={() => handleClick(tab)}>
                    <p>{tab}</p>
                </div>
            ))}
        </div>
    );
}