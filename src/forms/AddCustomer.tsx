import {addDoc, getDocs, collection, query, where, DocumentReference,DocumentData } from "firebase/firestore";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {auth, db} from "../firebase/firebase";
import '../styles/AddCustomer.css';
import {CustomerBrand, Customer} from "../types/Types";
import {BrandCard} from "./BrandCard";
import {countries} from "../data/Countries";







function AddCustomer() {
    const [availableBrands, setAvailableBrands] = useState<{brandDetails: CustomerBrand,chosen: boolean}[]>([]);
    const [customer, setCustomer] = useState<Customer>({
        id: '',
        address: '',
        name: '',
        city: '',
        country: '',
        brands: [],
    });
    const [error, setError] = useState<{message:string,show:boolean}>({message:"",show:false});

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: CustomerBrand[] = brandsData.docs.map((doc) => ({name: doc.data().name, id: doc.id, ref:doc.ref} as CustomerBrand));
            setAvailableBrands(brands.map((brand) => ({brandDetails: brand, chosen: false})));
            console.log(brands);
        };
        getBrands();
    }, []);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setCustomer((prevCustomer) => ({
            ...prevCustomer,
            [name]: value,
        }));
        setError({message:"",show:false})
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        // Perform any additional actions with the customer data (e.g., submit to server)
        console.log(customer);
        const uid = auth.currentUser?.uid;

        if(!countries.map((country) => country.name).includes(customer.country)) {
            setError({message:"Enter a valid country",show:true})
            return;
        } else {
            setError({message:"",show:false})
        }

        if (uid) {
            try {
                const brandRefs = customer.brands.map((brand) => brand.ref);
                await addDoc(collection(db, "customer"), {
                    uid: uid,
                    address: customer.address,
                    name: customer.name,
                    city: customer.city,
                    country: customer.country,
                    brands: brandRefs,
                });
            } catch (e) {
                setError({message:"Error adding to database. Try again later",show:true})
            }
        } else {
            setError({message:"User not logged in.",show:true});
        }
        // Reset the form
        setCustomer({
            ...customer,
            address: '',
            name: '',
            city: '',
            country: '',
            brands: [],
        });
        setAvailableBrands(availableBrands.map((availableBrand) => {
            return {brandDetails: availableBrand.brandDetails, chosen: false};
        }));
        setError({message:"New customer Added",show:true})
    };

    function onBrandClick(brand: CustomerBrand) {
        if(customer.brands.includes(brand)) {
            setCustomer({
                ...customer,
                brands: customer.brands.filter((customerBrand) => customerBrand.id !== brand.id),
            });
        } else {
            setCustomer({
                ...customer,
                brands: [...customer.brands, brand],
            });
        }
        setAvailableBrands(availableBrands.map((availableBrand) => {
            if (availableBrand.brandDetails.id === brand.id) {
                return {brandDetails: availableBrand.brandDetails, chosen: !availableBrand.chosen};
            } else {
                return availableBrand;
            }
        }));
        customer.brands.forEach((brand) => console.log(brand.name));
    }

    return (
        <form onSubmit={handleSubmit} method="dialog">
            <h3>Add a Customer</h3>
            <h4>Customer Details</h4>
            <label>
                Address:
                <input
                    type="text"
                    name="address"
                    value={customer.address}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <label>
                Name:
                <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <label>
                City:
                <input
                    type="text"
                    name="city"
                    value={customer.city}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <label>
                Country:
                <input
                    type="text"
                    name="country"
                    value={customer.country}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <h4>Available brands</h4>
            <div className="brandContainer">
                {availableBrands.map((brand) => (
                        <BrandCard brand={brand} onClick={onBrandClick}/>
                    )
                )}
            </div>
            <button type="submit">Submit</button>
            {error.show && <p>{error.message}</p>}
        </form>
    );
}

export default AddCustomer;