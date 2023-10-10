import React, {useEffect, useState} from "react";
import {OrderTable} from "../orderPage/OrderTable";
import AddOrder from "../../forms/AddOrder";
import EditableOrderTable from "../orderPage/EditableOrderTable";
import {Tabs} from "../../routing/Tabs";
import {collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Customer, CustomerBrand} from "../../types/Types";

type Season = {
    name:string;
    date:Date;
    uid:string;
    id:string;
}



export function SeasonsPage() {

    const tabs = ["Seasons", "New Season"];
    const [selectedTab, setSelectedTab] = useState<string>("Seasons");
    const [reactComp, setReactComp] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if(selectedTab === "Seasons"){
            setReactComp(<SeasonsTable/>);
        } else if(selectedTab === "New Season"){
            setReactComp(<NewSeason/>);
        }}, [selectedTab]
    );

    return (
        <div className="page">
            <Tabs setSelectedTab={setSelectedTab} selectedTab={selectedTab} tabs={tabs}/>
            <div>
                <h1>Seasons Page</h1>
                {reactComp}
            </div>
        </div>
    );
}


function SeasonsTable(){
    const [data, setData] = useState<Season[]>([]);
    useEffect(() => {
        async function getSeasons() {
            const seasonQuery = query(collection(db, "season"), where("uid", "==", auth.currentUser?.uid));
            const seasonData = await getDocs(seasonQuery);
            const seasons : Season[] = seasonData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    date: doc.data().date.toDate(),
                    uid: doc.data().uid,
                    id: doc.id,
                } as Season});
            seasons.sort((a,b) => {
                return a.date.getTime() - b.date.getTime();
            });
            setData(seasons);
        }
        getSeasons();
    }, []);


    const columnHelper = createColumnHelper<Season>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            footer: info => info.column.id,
        }),
        columnHelper.accessor("date", {
            header: 'Date',
            cell: info => info.getValue().getDate()+"/"+(info.getValue().getMonth()+1)+"/"+info.getValue().getFullYear(),
            footer: info => info.column.id,
        }),

    ];
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        defaultColumn: {
            minSize: 0,
            size: Number.MAX_SAFE_INTEGER,
            maxSize: Number.MAX_SAFE_INTEGER,
        }
    });


    return (
        <div>
            <h1>Seasons Table</h1>
            <div className="table-wrapper">
                <table>
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

}

function NewSeason() {

    return (
        <div>
            <h1>New Season</h1>
        </div>
    )
}