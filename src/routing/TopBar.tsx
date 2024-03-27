import {useEffect, useState} from "react";
import {auth} from "../firebase/firebase";
import {CustomerBrand} from "../types/Types";
import "../styles/TopBar.css";
import Logo from "../assets/logo.png";

function TopBarItem(props: { onClick : (destination:string) => void, name: string }) {
    const [active, setActive] = useState<{ active: boolean, classname: string }>({
        active: false,
        classname: "topbarItem"
    });
    const url = new URLSearchParams(window.location.search);
    const urlPage = url.get("page");

    useEffect(() => {
        function popstateHandler() {
            const url = new URLSearchParams(window.location.search);
            const urlPage = url.get("page");
            if (urlPage === props.name.toLowerCase()) {
                setActive({active: true, classname: "clickedTopBarItem"});
            } else {
                setActive({active: false, classname: "topbarItem"});
            }
        }

        addEventListener("popstate", popstateHandler);
        popstateHandler();
        return () => {
            removeEventListener("popstate", popstateHandler);
        };
    }, []);

    return (
        <div className={active.classname} onClick={() => props.onClick(props.name.toLowerCase())}>
            <p>{props.name}</p>
        </div>);
}

function TopBar(props: { navigate: (dest:string)=>void,loggedIn: boolean }) {
    const { loggedIn } = props;
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    function handleMenuClick() {
        setIsMenuOpen(!isMenuOpen);
    }
    function handleLogout(){
        auth.signOut();
    }
    function route(destination: string){
        props.navigate(destination);
    }


    return (<header className="topbar">
        <img className="logoImage" src={Logo} onClick={()=>route("frontpage")}/>
        {loggedIn ? (
            <>
                <TopBarItem name="Customers" onClick={route}/>
                <TopBarItem name="Brands" onClick={route}/>
                <TopBarItem name="Orders" onClick={route}/>
                <TopBarItem name="Seasons" onClick={route}/>
                <TopBarItem name="Budgets" onClick={route}/>
                <div className="rightSide">
                    <TopBarItem name="Logout" onClick={handleLogout}/>
                </div>
            </>
            ) : (
            <TopBarItem name="Login" onClick={route}/>

        )}
    </header>);
}

export default TopBar;