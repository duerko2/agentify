import React, {useEffect, useState} from "react";
import {collection, doc, DocumentReference, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowData,
    getFilteredRowModel, getPaginationRowModel
} from "@tanstack/react-table";

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
type Brand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}
type Season = {
    name:string;
    date:Date;
    uid:string;
    id:string;
}

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue()
        // We need to keep and update the state of the cell normally
        const [value, setValue] = React.useState(initialValue)

        // When the input is blurred, we'll call our table meta's updateData function
        const onBlur = () => {
            table.options.meta?.updateData(index, id, value)
        }

        // If the initialValue is changed external, sync it up with our state
        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])

        return (
            <input
                value={value as string}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        )
    },
}

function useSkipper() {
    const shouldSkipRef = React.useRef(true)
    const shouldSkip = shouldSkipRef.current

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = React.useCallback(() => {
        shouldSkipRef.current = false
    }, [])

    React.useEffect(() => {
        shouldSkipRef.current = true
    })

    return [shouldSkip, skip] as const
}

const columnHelper = createColumnHelper<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}>();


function EditableOrderTable(){
    const [selectedBrand, setSelectedBrand] = useState<Brand>();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeasons, setSelectedSeasons] = useState<{firstIndex:number,lastIndex:number}>({firstIndex:0,lastIndex:0});
    const [data, setData] = useState<{ customer:Customer,wholeSeason:{season:Season,budget:number,order:number}[]}[]>([]);
    const [showDelta, setShowDelta] = useState<boolean>(false);
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()
    const [columns, setColumns] = useState([
        columnHelper.accessor("customer", {
            header: "Customer",
            cell: (info) => info.getValue().name,
            footer: info => info.column.id,
            id: "customer"
        }),
        columnHelper.accessor("customer", {
            header: "City",
            cell: (info) => info.getValue().city,
            footer: info => info.column.id,
            id: "city"
        }),
        columnHelper.accessor("customer", {
            header: "Country",
            cell: (info) => info.getValue().country,
            footer: info => info.column.id,
            id: "country"
        }),
        columnHelper.accessor("wholeSeason", {
            header: "All Orders",
            cell: (info) => info.getValue().reduce((acc, curr) => parseFloat(curr.order.toString()) + parseFloat(acc.toString()),0).toLocaleString() + " " + selectedBrand?.currency,
            footer: info => info.column.id,
            id: "allOrders"
        })
    ]);



    useEffect(() => {
        async function getBrands() {
            const brandsQuery = query(collection(db, "brand"), where("uid", "==", auth.currentUser?.uid));
            const brandsData = await getDocs(brandsQuery);
            const brands : Brand[] = brandsData.docs.map((doc) => {
                return {
                    name: doc.data().name,
                    commission: doc.data().commission,
                    currency: doc.data().currency,
                    uid: doc.data().uid,
                    id: doc.id,
                } as Brand});
            setBrands(brands);
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
            setCustomers(customers);
        }
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
                console.log(a.date.getTime());
                return a.date.getTime() - b.date.getTime();
            });
            setSeasons(seasons);
        }
        if(auth.currentUser){
            getBrands();
            getCustomers();
            getSeasons();
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                getBrands();
                getCustomers();
                getSeasons();
            }
        });
    }, []);

    useEffect(() => {
        async function getOrders() {
            if(selectedBrand) {
                const orderQuery = query(collection(db, "order"), where("uid", "==", auth.currentUser?.uid), where("brand", "==", doc(db, "brand", selectedBrand.id)));
                const orderData = await getDocs(orderQuery);
                const orders: Order[] = orderData.docs.map((doc) => {
                    return {
                        amount: doc.data().amount,
                        brand: doc.data().brand,
                        customer: doc.data().customer,
                        season: doc.data().season,
                        type: doc.data().type,
                        uid: doc.data().uid,
                        id: doc.id,
                    } as Order
                });
                setOrders(orders);
                console.log(orders);
            }
        }
        if(auth.currentUser){
            getOrders();
        }
    }, [selectedBrand]);

    useEffect(() => {
        function putData(){
            if(!selectedBrand){
                return;
            }
            const customersByBrand = customers.filter((customer) => customer.brands.find((brand) => brand.id === selectedBrand.id));
            const data = customersByBrand.map((customer) => {
                const customerOrders = orders.filter((order) => order.customer.id === customer.id);
                const customerSeasons = customerOrders.map((order) => {
                    const season = seasons.find((season) => season.id === order.season.id);
                    if(season){
                        return {
                            season: season,
                            budget: order.amount,
                            order: order.amount,
                        }
                    }
                    return {
                        season: {
                            name: "",
                            date: new Date(),
                            uid: "",
                            id: "",
                        },
                        budget: 0,
                        order: 0,
                    }
                });
                return {
                    customer: customer,
                    wholeSeason: customerSeasons,
                }
            });

            data.forEach((d)=>{
                d.wholeSeason.sort((a,b) => {
                    return b.season.date.getTime() - a.season.date.getTime();
                });
            });
            setData(data);
        }
        putData();

    }, [orders]);

    function selectBrand(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const brand = brands.find((brand) => brand.id === target.value);
        if(brand){
            setSelectedBrand(brand);
        }
    }





    useEffect(() => {
        function changeColumns() {
            const initialColumns  = [
                columnHelper.accessor("customer", {
                    header: "Customer",
                    cell: (info) => info.getValue().name,
                    footer: info => info.column.id,
                    id: "customer"
                }),
                columnHelper.accessor("customer", {
                    header: "City",
                    cell: (info) => info.getValue().city,
                    footer: info => info.column.id,
                    id: "city"
                }),
                columnHelper.accessor("customer", {
                    header: "Country",
                    cell: (info) => info.getValue().country,
                    footer: info => info.column.id,
                    id: "country"
                })
            ];

            const seasonColumns = seasons.map((season) => {
                if (seasons.indexOf(season) >= selectedSeasons.firstIndex && seasons.indexOf(season) <= selectedSeasons.lastIndex) {
                    console.log(season.name);
                    const extraColumns = [
                        columnHelper.accessor("wholeSeason", {
                            header: season.name + " Budget",
                            cell: ({ getValue, row: { index }, column: { id }, table }) => {
                                let initialValue : string = "0";
                                const seasonInfo = getValue().find((s) => s.season.name === season.name)
                                if (seasonInfo)
                                    initialValue = parseFloat(seasonInfo.budget.toString()).toLocaleString();

                                const [value, setValue] = React.useState(initialValue)
                                return(
                                    <div>
                                <input
                                    value={value}
                                    onChange={e => {
                                        const value = e.target.value
                                        setValue(value)
                                        table.setGlobalFilter([{ id, value }])
                                    }
                                    }
                                />
                                        {selectedBrand?.currency}
                                    </div>)
                            },
                            footer: info => info.column.id,
                            id: season.name + "Budget",
                        }),
                        columnHelper.accessor("wholeSeason", {
                            header: season.name + " Order",
                            cell: (info) => {
                                const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                                if (seasonInfo)
                                    return parseFloat(seasonInfo.order.toString()).toLocaleString() + " " + selectedBrand?.currency;
                                else return 0;
                            },
                            footer: info => info.column.id,
                            id: season.name + "Order",
                        })
                    ];
                    if(showDelta){
                        extraColumns.push(
                            columnHelper.accessor("wholeSeason", {
                                header: season.name + " Delta",
                                cell: (info) => {
                                    const seasonInfo = info.getValue().find((s) => s.season.name === season.name)
                                    if (seasonInfo)
                                        return parseFloat((seasonInfo.order - seasonInfo.budget).toString()).toLocaleString();
                                    else return 0;
                                },
                                footer: info => info.column.id,
                                id: season.name + "diff",
                            }));
                    }
                    return extraColumns;
                } else return [];
            });

            setColumns([...initialColumns, ...seasonColumns.flat()]);

        }
        changeColumns();
    }, [selectedSeasons,showDelta])



    function selectFirstSeason(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const season = seasons.find((season) => season.id === target.value);
        if(season){
            setSelectedSeasons({... selectedSeasons,firstIndex:seasons.findIndex((s) => s.id === season.id)});
        }
    }
    function selectLastSeason(event:React.ChangeEvent){
        event.preventDefault();
        const target = event.target as HTMLSelectElement;
        const season = seasons.find((season) => season.id === target.value);
        if(season){
            setSelectedSeasons({... selectedSeasons, lastIndex:seasons.findIndex((s) => s.id === season.id)});
        }
    }

    const table = useReactTable(
        {
            columns: columns,
            defaultColumn: defaultColumn,
            data: data,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            autoResetPageIndex,
            meta: {
                updateData: (rowIndex, columnId, value) => {
                    // Skip page index reset until after next rerender
                    skipAutoResetPageIndex()
                    setData(old =>
                        old.map((row, index) => {
                            if (index === rowIndex) {
                                return {
                                    ...old[rowIndex]!,
                                    [columnId]: value,
                                }
                            }
                            return row
                        })
                    )
                },
            },
            debugTable: true,
        }
    );



    function clickShowDelta(event:React.FormEvent){
        event.preventDefault();
        setShowDelta(!showDelta);
    }

    return <div className="customers">
        <h1>Set Orders</h1>
        <div className="selection-wrapper">
            <div className="selection">
                <label htmlFor="brand"></label>
                <select name="brand" id="brand" onChange={selectBrand}>
                    <option value="">Select Brand</option>
                    {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
            </div>
            <div className="selection">
                <label htmlFor="firstSeason"></label>
                <select name="firstSeason" id="firstSeason" onChange={selectFirstSeason}>
                    <option value="">From Season</option>
                    {
                        seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)
                    }
                </select>
            </div>
            <div className="selection">
                <label htmlFor="secondSeason"></label>
                <select name="secondSeason" id="secondSeason" onChange={selectLastSeason}>
                    <option value="">To Season</option>
                    {
                        seasons.map((season) =>
                            <option key={season.id} value={season.id}>{season.name}</option>
                        )
                    }
                </select>
            </div>
            <div className="selection">
                <label htmlFor="showDelta">
                    Show Delta
                    <input name="showDelta" id="showDelta" type="checkbox" checked={showDelta} onInput={clickShowDelta}/>
                </label>
            </div>
        </div>
        <div className="table-wrapper"> {table &&
            <table>
                <thead>
                {table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>
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
                </tr>)}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>)}
                </tbody>
            </table>
        }
        </div>
    </div>;
}

export default EditableOrderTable;