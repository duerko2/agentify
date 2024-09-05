import {DocumentData, DocumentReference} from "firebase/firestore";
export type {CustomerBrand,Customer,Brand};

interface CustomerBrand {
    name: string;
    id: string;
    ref: DocumentReference<DocumentData>;
}
export interface Agency {
    agencyId: string;
    name: string;
}
interface Brand {
    name: string;
    commission: number;
    currency: string;
    brandId: string;
}

interface Customer {
    zipCode: string;
    id: string;
    address: string;
    name: string;
    city: string;
    country: string;
    brands: CustomerBrand[];
    brandIds: string[];
    brandNames: string[];
    customerId: string;
    email: string;
}
export type Order = {
    amount:number;
    brand:Brand;
    customer:string;
    season:string;
    type:string;
    createdAt:Date;
    uid:string;
}
export type Season = {
    name:string;
    date:Date;
    uid:string;
    id:string;
}