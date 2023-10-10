import {addDoc, getDocs, collection, query, where, DocumentReference,DocumentData,doc} from "firebase/firestore";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {auth, db} from "../firebase/firebase";
import '../styles/AddCustomer.css';
import {onAuthStateChanged} from "firebase/auth";





type Order = {
    amount:number;
    brand:DocumentReference;
    customer:DocumentReference;
    season:DocumentReference;
    type:string;
    uid:string;
    id:string;
}
type Customer = {
    name:string;
    address:string;
    city:string;
    country:string;
    brands:DocumentReference[];
    uid:string;
    id:string;
}
type myBrand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}
type Season = {
    name:string;
    uid:string;
    id:string;
}

function AddOrder() {
    const [availableBrands, setAvailableBrands] = useState<myBrand[]>([]);
    const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
    const [order,setOrder] = useState<Order>(
        {
            amount:0,
            brand:doc(db,"brand/1"),
            customer:doc(db,"customer/1"),
            season:doc(db,"season/1"),
            type:"",
            uid:"",
            id:""
        });





    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands : myBrand[] = brandsData.docs.map((doc) => {
                return {
                        name: doc.data().name,
                        commission: doc.data().commission,
                        currency: doc.data().currency,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as myBrand});
            setAvailableBrands(brands);
        }
        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            const seasons : Season[] = seasonData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season});
            setAvailableSeasons(seasons);
        }

        async function getCustomers() {
            const customerQuery = query(collection(db, "customer"), where("uid", "==", auth.currentUser?.uid));
            const customerData = await getDocs(customerQuery);
            console.log(customerData.docs[3].data().brands[0].id);
            const customers : Customer[] = customerData.docs.map((doc) => {
                return {
                    address: doc.data().address,
                    name: doc.data().name,
                    city: doc.data().city,
                    country: doc.data().country,
                    brands: doc.data().brands,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Customer});
            setAvailableCustomers(customers);
            console.log(availableCustomers)
        }
        if (auth.currentUser) {
            getBrands().then(getSeasons).then(getCustomers);
        }
        onAuthStateChanged(auth, (nextUser) => {
            getBrands().then(getSeasons).then(getCustomers);
        });

    }, []);

    const selectBrand = (event: ChangeEvent<HTMLSelectElement>) => {
        const brand = availableBrands.find((brand) => brand.id === event.target.value);
        if (brand) {
            const brandRef = doc(db,'brand/'+brand.id);
            setOrder({...order,brand:brandRef});
        }
    }
    const selectSeason = (event: ChangeEvent<HTMLSelectElement>) => {
        const season = availableSeasons.find((season) => season.id === event.target.value);
        if(season) {
            const seasonRef = doc(db,'season/'+season.id);
            setOrder({...order,season:seasonRef});
        }

    }
    const selectCustomer = (event: ChangeEvent<HTMLSelectElement>) => {
        const customer = availableCustomers.find((customer) => customer.id === event.target.value);
        if (customer) {
            const customerRef = doc(db,'customer/'+customer.id);
            setOrder({...order,customer:customerRef});
        }
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const orderRef = collection(db, "order");
        if(auth.currentUser) {
            const payload = {
                amount: parseInt(order.amount.toString()),
                brand: order.brand,
                customer: order.customer,
                season: order.season,
                type: order.type,
                uid: auth.currentUser.uid,
            }
            await addDoc(orderRef, payload);
        }


        // Reset the form
        setOrder(
            {
                amount:0,
                brand:doc(db,"brand/1"),
                customer:doc(db,"customer/1"),
                season:doc(db,"season/1"),
                type:"",
                uid:"",
                id:""
            }
        );
    };


    const handleChange = (event: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        setOrder((prevOrder) => ({
            ...prevOrder,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} method="dialog">
            <h3>Add an Order</h3>
            <p>{order.season.path}{order.brand.path}{order.customer.path}{order.id}{order.type}{order.amount}</p>
            <label htmlFor="brand">Brand</label>
            <select name="brand" id="brand" onChange={selectBrand}>
                <option value="">Select a brand</option>
                {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
            </select>
            <label htmlFor="season">Season</label>
            <select name="season" id="season" onChange={selectSeason}>
                <option value="">Select a season</option>
                {availableSeasons.map((season) => (
                    <option key={season.id} value={season.id}>{season.name}</option>
                ))}
            </select>
            <label htmlFor="customer">Customer</label>
            <select name="customer" id="customer" onChange={selectCustomer}>
                <option value="">Select a customer</option>
                {availableCustomers.map((customer) => (
                    customer.brands.map((doc)=>doc.id).includes(order.brand.id) &&
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
            </select>
            <br/>
            <label htmlFor="type">Type</label>
            <select name="type" id="type" onChange={handleChange}>
                <option value="">Select a type</option>
                <option value="reorder">Re-order</option>
                <option value="prebook">Prebook</option>
            </select>
            <label htmlFor="amount">Amount</label>
            <input type="number" name="amount" id="amount" value={order.amount} onChange={handleChange}/>

            <button type="submit">Submit</button>
        </form>
    );
}

export default AddOrder;