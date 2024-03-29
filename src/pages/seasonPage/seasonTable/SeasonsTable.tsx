import React, {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../../firebase/firebase";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Season} from "../../../types/Types";
import {getSeasonsColumns} from "./SeasonsTableColumns";
import {AgentifyTable} from "../../../component/AgentifyTable";

export function SeasonsTable() {
    const [data, setData] = useState<Season[]>([]);
    useEffect(() => {
        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            const seasons: Season[] = seasonData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    date: doc.data().date.toDate(),
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season
            });
            seasons.sort((a, b) => {
                return a.date.getTime() - b.date.getTime();
            });
            setData(seasons);
        }

        getSeasons();
    }, []);

    const columns = getSeasonsColumns();

    return (
        <div>
            <AgentifyTable data={data} columns={columns} title={"Seasons"} globalFilter={false}/>
        </div>
    )

}