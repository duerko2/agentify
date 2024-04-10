import {createColumnHelper} from "@tanstack/react-table";

type Brand = {
    name:string;
    commission:number;
    currency:string;
    uid:string;
    id:string;
}
const columnHelper = createColumnHelper<{brand:Brand,orderTotal:number,budgetTotal:number,reorderTotal:number, reorderBudgetTotal:number}>();

export function getPreOrderColumns(data: { brand: Brand; orderTotal: number; budgetTotal: number; reorderTotal: number; reorderBudgetTotal: number }[], conversions: { [p: string]: number }, selectedCurrency: string){

    return [
        columnHelper.accessor("brand", {
            header: "Brand",
            cell: (info) => info.getValue().name,
            footer: "TOTAL",
            id: "brand"
        }),
        columnHelper.accessor("budgetTotal", {
            header: "Budget",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.budgetTotal/conversions[b.brand.currency], 0).toFixed(1).toLocaleString(),
            id: "budget"
        }),
        columnHelper.accessor("orderTotal", {
            header: "Orders",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.orderTotal/conversions[b.brand.currency], 0).toFixed(1).toLocaleString(),
            id: "orders"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => (info.row.original.orderTotal - info.row.original.budgetTotal).toLocaleString(),
            footer: data.reduce((a,b) => a + (b.orderTotal - b.budgetTotal)/conversions[b.brand.currency], 0).toFixed(1).toLocaleString(),
            id: "difference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => (((info.row.original.orderTotal)/info.row.original.budgetTotal*100)|0).toLocaleString()+"%",
            footer: ((data.reduce((a,b) => a + (b.orderTotal)/conversions[b.brand.currency], 0)/data.reduce((a,b) => a + b.budgetTotal/conversions[b.brand.currency], 0)*100)|0).toLocaleString()+"%",
            id: "differencePercent"
        }),
        columnHelper.accessor("brand", {
            header: "Currency",
            cell: (info) => info.getValue().currency,
            footer: selectedCurrency,
            id: "currency"
        }),
        columnHelper.accessor("brand", {
            header: "Commission",
            cell: (info) => info.getValue().commission+"%",
            footer: "",
            id: "commission"
        }),
        columnHelper.accessor("brand", {
            header: "Budgeted Commission",
            cell: (info) => (info.getValue().commission * info.row.original.budgetTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toFixed(1).toLocaleString(),
            id: "budgetCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Expected Commission",
            cell: (info) => (info.getValue().commission * info.row.original.orderTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toFixed(1).toLocaleString(),
            id: "expCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => ((info.getValue().commission * info.row.original.orderTotal*0.01) - (info.getValue().commission * info.row.original.budgetTotal*0.01)).toLocaleString(),
            footer: info => (data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)).toFixed(1).toLocaleString(),
            id: "commissionDifference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => ((((info.getValue().commission * info.row.original.orderTotal*0.01) - (info.getValue().commission * info.row.original.budgetTotal*0.01))/(info.getValue().commission * info.row.original.budgetTotal*0.01)*100)|0).toLocaleString()+"%",
            footer: info => ((((data.reduce((a,b) => a + b.orderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0))/(data.reduce((a,b) => a + b.budgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)))*100)|0).toLocaleString()+"%",
            id: "commissionDifferencePercent"
        })
    ];
}
export function getReOrderColumns(data: { brand: Brand; orderTotal: number; budgetTotal: number; reorderTotal: number; reorderBudgetTotal: number }[], conversions: { [p: string]: number }, selectedCurrency: string){
    return [
        columnHelper.accessor("brand", {
            header: "Brand",
            cell: (info) => info.getValue().name,
            footer: "TOTAL",
            id: "brand"
        }),
        columnHelper.accessor("reorderBudgetTotal", {
            header: "Budget",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.reorderBudgetTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budget"
        }),
        columnHelper.accessor("reorderTotal", {
            header: "Orders",
            cell: (info) => info.getValue().toLocaleString(),
            footer: data.reduce((a,b) => a + b.reorderTotal/conversions[b.brand.currency], 0).toLocaleString(),
            id: "orders"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => (info.row.original.reorderTotal - info.row.original.reorderBudgetTotal).toLocaleString(),
            footer: data.reduce((a,b) => a + (b.reorderTotal - b.reorderBudgetTotal)/conversions[b.brand.currency], 0).toLocaleString(),
            id: "difference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => (((info.row.original.reorderTotal - info.row.original.reorderBudgetTotal)/info.row.original.reorderBudgetTotal*100)|0).toLocaleString()+"%",
            footer: ((data.reduce((a,b) => a + (b.reorderTotal - b.reorderBudgetTotal)/conversions[b.brand.currency], 0)/data.reduce((a,b) => a + b.reorderBudgetTotal/conversions[b.brand.currency], 0)*100)|0).toLocaleString()+"%",
            id: "differencePercent"
        }),
        columnHelper.accessor("brand", {
            header: "Currency",
            cell: (info) => info.getValue().currency,
            footer: selectedCurrency,
            id: "currency"
        }),
        columnHelper.accessor("brand", {
            header: "Commission",
            cell: (info) => info.getValue().commission+"%",
            footer: "",
            id: "commission"
        }),
        columnHelper.accessor("brand", {
            header: "Budgeted Commission",
            cell: (info) => (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "budgetCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Expected Commission",
            cell: (info) => (info.getValue().commission * info.row.original.reorderTotal*0.01).toLocaleString(),
            footer: info => data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0).toLocaleString(),
            id: "expCommission"
        }),
        columnHelper.accessor("brand", {
            header: "Difference",
            cell: (info) => ((info.getValue().commission * info.row.original.reorderTotal*0.01) - (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01)).toLocaleString(),
            footer: info => (data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)).toLocaleString(),
            id: "commissionDifference"
        }),
        columnHelper.accessor("brand", {
            header: "% of Budget",
            cell: (info) => ((((info.getValue().commission * info.row.original.reorderTotal*0.01) - (info.getValue().commission * info.row.original.reorderBudgetTotal*0.01))/(info.getValue().commission * info.row.original.reorderBudgetTotal*0.01)*100)|0).toLocaleString()+"%",
            footer: info => ((((data.reduce((a,b) => a + b.reorderTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0) - data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0))/(data.reduce((a,b) => a + b.reorderBudgetTotal*b.brand.commission*0.01/conversions[b.brand.currency], 0)))*100)|0).toLocaleString()+"%",
            id: "commissionDifferencePercent"
        })
    ];
}