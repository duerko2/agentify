import React, {useEffect, useState} from "react";
import {Brand} from "../../../types/Types";
import {collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {getBrandColumns} from "./BrandTableColumns";
import {AgentifyTable} from "../../../component/AgentifyTable";
import {useAgency} from "../../../firebase/AgencyContext";
import {getAllBrands} from "../../../services/BrandService";

export function BrandTable() {
    const { agency } = useAgency();
    const [data, setData] = useState<Brand[]>([]);

    useEffect(() => {
        async function getBrands() {
            const brands = await getAllBrands(agency);

            if(!brands) {
                return;
            }
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