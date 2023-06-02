import {addDoc, getDocs, collection, query, where, DocumentReference,DocumentData } from "firebase/firestore";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {auth, db} from "../firebase/firebase";
import '../styles/AddCustomer.css';
import {CustomerBrand, Customer} from "../types/Types";
import {BrandCard} from "./BrandCard";







function AddCustomer() {
    const [availableBrands, setAvailableBrands] = useState<CustomerBrand[]>([]);
    const [customer, setCustomer] = useState<Customer>({
        address: '',
        name: '',
        city: '',
        country: '',
        brands: [],
    });

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: CustomerBrand[] = brandsData.docs.map((doc) => ({name: doc.data().name, id: doc.id, ref:doc.ref} as CustomerBrand));
            setAvailableBrands(brands)
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
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        // Perform any additional actions with the customer data (e.g., submit to server)
        console.log(customer);
        const uid = auth.currentUser?.uid;

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
                console.error("Error adding document: ", e);
            }
        } else {
            console.log("User not logged in");
        }
        // Reset the form
        setCustomer({
            address: '',
            name: '',
            city: '',
            country: '',
            brands: [],
        });
    };

    function onBrandClick(brand: CustomerBrand) {
        setCustomer({
            ...customer,
            brands: [...customer.brands, brand],
        });
        setAvailableBrands(availableBrands.filter((b) => b.id !== brand.id));
        console.log("Clicked on brand: " + brand.name);
        console.log("Customer brands: " + customer.brands);
        console.log("Available brands: " + availableBrands);
    }

    return (
        <form onSubmit={handleSubmit} method="dialog">
            <h3>Add a Customer</h3>
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
            <h4>Available Brands</h4>
            <div className="brandContainer">
                {availableBrands.map((brand) => (
                        <BrandCard brand={brand} onClick={onBrandClick}/>
                    )
                )}
            </div>
            <button type="submit">Submit</button>
        </form>
    );
}

export default AddCustomer;