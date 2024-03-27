import {Customer, CustomerBrand} from "../types/Types";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {auth, db} from "../firebase/firebase";
import {addDoc, collection, doc, getDocs, query, setDoc, updateDoc, where} from "firebase/firestore";
import Draggable from 'react-draggable';
import "../styles/form.css";
import {BrandCard} from "./BrandCard";



export function ChangeCustomer({customer, setChangeCustomer}: { customer: Customer,setChangeCustomer:Dispatch<SetStateAction<{ show: boolean; customer: Customer; }>> }) {
    const [customerDetails, setCustomerDetails] = useState<Customer>(customer);
    const [availableBrands, setAvailableBrands] = useState<{brandDetails: CustomerBrand,chosen: boolean}[]>([]);


    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: CustomerBrand[] = brandsData.docs.map((doc) => ({name: doc.data().name, id: doc.id, ref:doc.ref} as CustomerBrand));
            setAvailableBrands(brands.map((brand) => ({brandDetails: brand, chosen: customerDetails.brands.map((customerBrand) => customerBrand.id).includes(brand.id)})));
        };
        getBrands();
    }, []);

    function onBrandClick(brand: CustomerBrand) {
        setCustomerDetails((prevCustomer) => {
            if (prevCustomer.brands.map((brand) => brand.id).includes(brand.id)) {
                return {
                    ...prevCustomer,
                    brands: prevCustomer.brands.filter((customerBrand) => customerBrand.id !== brand.id)
                };
            } else {
                return {
                    ...prevCustomer,
                    brands: [...prevCustomer.brands, brand]
                };
            }
        });
        setAvailableBrands(availableBrands.map((availableBrand) => {
            if (availableBrand.brandDetails.id === brand.id) {
                return {brandDetails: availableBrand.brandDetails, chosen: !availableBrand.chosen};
            } else {
                return availableBrand;
            }
        }));
    }


    async function submitty(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const customerRef = doc(db, "customer", customer.id);
        const customerDoc = {
            name: customerDetails.name,
            address: customerDetails.address,
            city: customerDetails.city,
            country: customerDetails.country,
            brands: customerDetails.brands?.map((brand) => doc(db,"brands",brand.id)),
            uid: auth.currentUser?.uid,
        };
        try {
            await setDoc(customerRef, customerDoc);
            setChangeCustomer({show: false, customer: customer})
        } catch (e) {

        }

    }


    function closePopUp(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setChangeCustomer({show: false, customer: customer})
    }

    return (
        <Draggable positionOffset={{ x: '-50%', y: '-50%' }} >
            <form onSubmit={submitty} className="form-box-window" >
                <button className="close-button" onClick={closePopUp}>
                    X
                </button>
                <label>
                    Name:
                    <input type="text" value={customerDetails.name} onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})} />
                </label>
                <label>
                    Address:
                    <input type="text" value={customerDetails.address} onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} />
                </label>
                <label>
                    City:
                    <input type="text" value={customerDetails.city} onChange={(e) => setCustomerDetails({...customerDetails, city: e.target.value})} />
                </label>
                <label>
                    Country:
                    <input type="text" value={customerDetails.country} onChange={(e) => setCustomerDetails({...customerDetails, country: e.target.value})} />
                </label>
                <div className="brandContainer">
                    {availableBrands.map((brand) => (
                            <BrandCard brand={brand} onClick={onBrandClick}/>
                        )
                    )}
                </div>
                <input type="submit" value="Save" />
            </form>
        </Draggable>
    );
}
