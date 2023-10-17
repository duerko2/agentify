import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {addDoc, collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import { CSVLink, CSVDownload } from "react-csv";



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

export function DownloadBudgetTemplate() {
    const [availableBrands, setAvailableBrands] = useState<myBrand[]>([]);
    const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
    const [data, setData] = useState<{customers:{customerID:string,customerName:string}[],seasonID:string,seasonName:string,brandName:string,brandId:string,orderType:string}>({customers:[],seasonID:"",seasonName:"",brandName:"",brandId:"",orderType:""});
    const [CSVData, setCSVData] = useState<{ headers: {label: string, key: string}[],data:{ customerId: string; customerName: string; seasonId: string; seasonName: string; brandId: string; brandName: string; orderType: string; currency: string | undefined; amount: number; }[]}>({headers:[],data:[]});

    useEffect(() => {
        function setTheDownloadData() {
            const headers = [
                {label:"customerID",key:"customerId"},
                {label:"customerName",key:"customerName"},
                {label:"seasonID",key:"seasonId"},
                {label:"seasonName",key:"seasonName"},
                {label:"brandID",key:"brandId"},
                {label:"brandName",key:"brandName"},
                {label:"orderType",key:"orderType"},
                {label:"currency",key:"currency"},
                {label:"amount",key:"amount"}
            ];
            const csvData = data.customers.map((customer) => {return {customerId:customer.customerID,customerName:customer.customerName,seasonId:data.seasonID,seasonName:data.seasonName,brandId:data.brandId,brandName:data.brandName,orderType:data.orderType,currency:availableBrands.find((brand) => brand.id === data.brandId)?.currency,amount:0}});
            setCSVData({headers:headers,data:csvData});
        }
        setTheDownloadData();
    }, [data]);

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
            const customers : {customerID:string,customerName:string}[] = availableCustomers.filter((customer) => customer.brands.filter((b)=>b.id==brandRef.id)).map((customer) => {
                return {customerID:customer.id,customerName:customer.name}
            });
            console.log(customers);
            setData({...data,customers:customers,brandId:brand.id,brandName:brand.name})
        }
    }
    const selectSeason = (event: ChangeEvent<HTMLSelectElement>) => {
        const season = availableSeasons.find((season) => season.id === event.target.value);
        if(season) {
            setData({...data,seasonID:season.id,seasonName:season.name});
        }

    }


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const headers = [
            {label:"customerID",key:"customerId"},
            {label:"customerName",key:"customerName"},
            {label:"seasonID",key:"seasonId"},
            {label:"seasonName",key:"seasonName"},
            {label:"brandID",key:"brandId"},
            {label:"brandName",key:"brandName"},
            {label:"orderType",key:"orderType"},
            {label:"currency",key:"currency"},
            {label:"amount",key:"amount"}
        ];

        const csvData = data.customers.map((customer) => {return {customerId:customer.customerID,customerName:customer.customerName,seasonId:data.seasonID,seasonName:data.seasonName,brandId:data.brandId,brandName:data.brandName,orderType:data.orderType,currency:availableBrands.find((brand) => brand.id === data.brandId)?.currency,amount:0}});
    };


    const handleChange = (event: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = event.target;
        setData({...data,orderType:value});
    };

    return (
        <form onSubmit={handleSubmit} method="dialog">
            <label htmlFor="brand">Brand</label>
            <select name="brand" id="brand" onChange={selectBrand}>
                <option value="">Select a brand</option>
                {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
            </select>
            <br/>
            <label htmlFor="season">Season</label>
            <select name="season" id="season" onChange={selectSeason}>
                <option value="">Select a season</option>
                {availableSeasons.map((season) => (
                    <option key={season.id} value={season.id}>{season.name}</option>
                ))}
            </select>
            <br/>
            <label htmlFor="type">Type</label>
            <select name="type" id="type" onChange={handleChange}>
                <option value="">Select a type</option>
                <option value="reorder">Re-order</option>
                <option value="prebook">Prebook</option>
            </select>
            <br/>
            <CSVLink data={CSVData?.data} headers={CSVData?.headers}>Download me</CSVLink>
        </form>
    );
}