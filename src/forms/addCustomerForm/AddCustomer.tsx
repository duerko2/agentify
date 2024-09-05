import {addDoc, getDocs, collection, query, where, DocumentReference,DocumentData } from "firebase/firestore";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {auth, db} from "../../firebase/firebase";
import '../../styles/AddCustomer.css';
import {CustomerBrand, Customer} from "../../types/Types";
import {BrandCard} from "../BrandCard";
import {countries} from "../../data/Countries";
import {createCustomer, NewCustomerDTO} from "../../services/CustomerService";

const DEFAILT_AGENT_ID = "123";

function AddCustomer() {
    const [availableBrands, setAvailableBrands] = useState<{brandDetails: CustomerBrand,chosen: boolean}[]>([]);
    const [customer, setCustomer] = useState<NewCustomerDTO>({
        address: '',
        city: '',
        zipCode: "",
        country: '',
        name: '',
        brandIds: [],
        email: '',
    });
    const [message, setMessage] = useState<{message:string,show:boolean}>({message:"",show:false});

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: CustomerBrand[] = brandsData.docs.map((doc) => ({name: doc.data().name, id: doc.id, ref:doc.ref} as CustomerBrand));
            setAvailableBrands(brands.map((brand) => ({brandDetails: brand, chosen: false})));
        };
        getBrands();
    }, []);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        setCustomer((prevCustomer) => ({
            ...prevCustomer,
            [name]: value,
        }));
        setMessage({message:"",show:false})
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if(!countries.map((country) => country.name).includes(customer.country)) {
            setMessage({message:"Enter a valid country",show:true})
            return;
        } else {
            setMessage({message:"",show:false})
        }

        try {
            createCustomer(customer);
            setMessage({message:"New customer Added",show:true})
        } catch (e) {
            setMessage({message:"Error adding to database. Try again later",show:true})
            return;
        }
        // Reset the form
        setCustomer({
            ...customer,
            address: '',
            name: '',
            city: '',
            zipCode: '',
            country: '',
            email: '',
            brandIds: [],
        });
        setAvailableBrands(availableBrands.map((availableBrand) => {
            return {brandDetails: availableBrand.brandDetails, chosen: false};
        }));
    };

    function onBrandClick(brand: CustomerBrand) {
        if(customer.brandIds.includes(brand.id)) {
            setCustomer({
                ...customer,
                brandIds: customer.brandIds.filter((id) => id!== brand.id),
            });
        } else {
            setCustomer({
                ...customer,
                brandIds: [...customer.brandIds, brand.id],
            });
        }
        setAvailableBrands(availableBrands.map((availableBrand) => {
            if (availableBrand.brandDetails.id === brand.id) {
                return {brandDetails: availableBrand.brandDetails, chosen: !availableBrand.chosen};
            } else {
                return availableBrand;
            }
        }));
    }

    return (
        <div className="form-container">
        <form onSubmit={handleSubmit} method="dialog">
            <h3>Add a new customer</h3>
            <h4>Customer details</h4>

            <div className="input-line">

                <div className="input-field">
                    <label>
                        <p>Name</p>
                        <input size={50}
                               type="text"
                               name="name"
                               value={customer.name}
                               onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="input-field">
                    <label>
                        <p>Email</p>
                        <input size={50}
                            type="text"
                            name="email"
                            value={customer.email}
                            onChange={handleChange}
                        />
                    </label>
                </div>

            </div>

            <div className="input-line">
                <div className="input-field-full-width">
                    <label>
                        <p>Address</p>
                        <input className="full-width"
                            type="text"
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                        />
                    </label>
                </div>
            </div>


            <div className="input-line">

                <div className="input-field">
                    <label>
                        <p>City</p>
                        <input
                            type="text"
                            name="city"
                            value={customer.city}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="input-field">
                    <label>
                        <p>Zip Code</p>
                        <input
                            type="text"
                            name="zipCode"
                            value={customer.zipCode}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="input-field">
                    <label>
                        <p>Country</p>
                        <input
                            type="text"
                            name="country"
                            value={customer.country}
                            onChange={handleChange}
                        />
                    </label>
                </div>

            </div>

            <h4>Brands</h4>
            <div className="brandContainer">
                {availableBrands.map((brand) => (
                        <BrandCard brand={brand} onClick={onBrandClick}/>
                    )
                )}
            </div>
            <button type="submit">Submit</button>
            {message.show && <p>{message.message}</p>}
        </form>
        </div>
    );
}

export default AddCustomer;