import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Login from "./pages/loginPage/Login";
import {auth} from './firebase/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import AddCustomer from "./forms/AddCustomer";
import AddBrand from "./forms/AddBrand";
import TopBar from "./routing/TopBar";
import CustomerPage from "./pages/customerPage/CustomerPage";
import BrandPage from "./pages/brandPage/BrandPage";
import OrderPage from "./pages/orderPage/OrderPage";
import FrontPage from "./pages/frontPage/FrontPage";
import {SeasonsPage} from "./pages/seasonPage/SeasonsPage";
import BudgetPage from "./pages/budgetPage/BudgetPage";


function App() {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [page, setPage] = useState<string>("frontpage");
    const [navigating, setNavigating] = useState<boolean>(true);

    useEffect(() => {
        function popstateHandler() {
            const url = new URLSearchParams(window.location.search);
            const urlPage = url.get("page");
            setPage(urlPage || "frontpage");
            setNavigating(true);
        }
        addEventListener("popstate", popstateHandler);
        popstateHandler();
        return () => {
            removeEventListener("popstate", popstateHandler);
        };
    }, [])

    useEffect(() => {
        setNavigating(false);
    }, [navigating]);


    useEffect(() => {
        onAuthStateChanged(auth,(nextUser) => {
            if (nextUser) {
                setLoggedIn(true);
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/auth.user
                const uid = nextUser.uid;
                // ...
            } else {
                setLoggedIn(false);
                navigate("frontpage");
                // User is signed out
                // ...
            }
        });
        }, []);

    function navigate(dest:string) {
        history.pushState({}, "", "?page="+dest);
        dispatchEvent(new PopStateEvent("popstate"));
    }
    const pageClasses = `card ${navigating ? "navigating" : "navigated"}`;


    return (
    <div className="App">
        <TopBar
            navigate={navigate}
            loggedIn={loggedIn}/>
        {loggedIn &&
            page==="frontpage" &&
            <div>
                <FrontPage/>
            </div> ||
            page==="customers" &&
            <div>
                <CustomerPage/>
            </div> ||
            page==="brands" &&
            <div>
                <BrandPage/>
            </div> ||
            page==="orders" &&
            <div>
                <OrderPage/>
            </div>
            ||
            page==="seasons" &&
            <div>
                <SeasonsPage/>
            </div>
            ||
            page==="budgets" &&
            <div>
                <BudgetPage/>
            </div>
        }
        {!loggedIn &&
            <div>
                <h1>Not logged in</h1>
                <Login/>
            </div>
        }
    </div>
  );
}

export default App;
