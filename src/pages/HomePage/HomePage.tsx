import {Tabs} from "../../routing/Tabs";
import React from "react";
import "../../styles/homefrontpage.css"
import {AgentifyButton} from "../../component/AgentifyButton";

export function HomePage(props: {navigate: (dest:string)=>void}) {

    function navigateToLogin(){
        props.navigate("login");
    }
    return (
                <div className="homepage">
                        <h1>Welcome to Agentify</h1>
                        <h3>Unlock Your Data - No More Excel</h3>

                <section>
                        <p>This is a sales tracker/tool demo for monitoring sales and commission of agencies in the fashion biz. </p>
                </section>

                <section>
                        <h2>Features</h2>
                                <p><strong>Easy setup</strong> Setup brands, their currency and commission structure. Add customers, choose which brands each customer can buy. Add seasonal budgets for each brand. Start collecting orders. Easy peasy.
                    </p>
                                <p><strong>Performance dashboard</strong> Customizable dashboards to focus on what matters most to your business at any given time. Monitor sales and commission in real time. See how your sales are doing compared to your budget.
                                </p>
                                <p><strong>Commission monitoring</strong> Remove the guesswork. Agentify calculates commission based on the commission structure you have set up. No more manual calculations. Get your commission in full and when you're owed.
                                </p>
                                <p><strong>Brand and customer synergy </strong> Agentify calculates the synergy between your brands and customers. Gain insight into which brands give you the most value.
                                </p>
                </section>

                <section>
                        <h3>Ready for the demo?</h3>
                        <p>Login with your test account</p>
                    <AgentifyButton buttonText={"Login"} onClick={navigateToLogin} primaryButton={true}></AgentifyButton> <AgentifyButton buttonText={"Nothing here yet"} onClick={()=>{}} primaryButton={false}></AgentifyButton>
                </section>

                </div>

    );
}