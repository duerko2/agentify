import {ChangeEvent, FormEvent, useState} from "react";
import {Brand} from "../types/Types";
import {auth,db} from "../firebase/firebase";
import {addDoc, collection} from "firebase/firestore";


function AddBrand() {
    const [brand, setBrand] = useState<Brand>({'name':'','currency':'','commission':0,uid:auth.currentUser?.uid || ''});
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setBrand((prevBrand) => ({
            ...prevBrand,
            [name]: value,
        }));
    };
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if(brand.uid){
            try{
                await addDoc(collection(db, "brand"), {
                    commission: brand.commission,
                    currency: brand.currency,
                    name: brand.name,
                    uid: brand.uid,
                });
            } catch (e) {
                console.log(e)
            }
        }
        console.log(brand);
        setBrand({'name':'','currency':'','commission':0,uid:auth.currentUser?.uid || ''})
    }


    return (
        <form onSubmit={handleSubmit}>
            <h3>Add a brand</h3>
            <label>
                Name:
                <input
                    type="text"
                    name="name"
                    value={brand.name}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <label>
                Currency:
                <input
                    type="text"
                    name="currency"
                    value={brand.currency}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <label>
                Commission:
                <input
                    type="number"
                    name="commission"
                    value={brand.commission}
                    onChange={handleChange}
                />
            </label>
            <br/>
            <input type="submit" value="Submit"/>
        </form>

    );
}

export default AddBrand;