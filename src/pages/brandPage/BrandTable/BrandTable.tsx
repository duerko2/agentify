import React, {useEffect, useState} from "react";
import {Brand} from "../../../types/Types";
import {collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {getBrandColumns} from "./BrandTableColumns";
import {AgentifyTable} from "../../../component/AgentifyTable";

export function BrandTable() {
    const [data, setData] = useState<Brand[]>([]);

    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands: Brand[] = brandsData.docs.map((doc) => {
                return (
                    {
                        name: doc.data().name,
                        commission: doc.data().commission,
                        currency: doc.data().currency,
                    } as Brand);
            });
            setData(brands)
        }

        onAuthStateChanged(auth, (nextUser) => {
            getBrands();
        });

        getBrands();
    }, []);


    const columns = getBrandColumns()


    return (
        <div className="customers">
            <AgentifyTable data={data} columns={columns} title={"Brands"} />
        </div>
    );
}