import {DocumentData, DocumentReference} from "firebase/firestore";
export type {CustomerBrand,Customer,Brand};

interface CustomerBrand {
    name: string;
    id: string;
    ref: DocumentReference<DocumentData>;
}
interface Brand {
    name: string;
    commission: number;
    currency: string;
    uid: string;
}

interface Customer {
    address: string;
    name: string;
    city: string;
    country: string;
    brands: CustomerBrand[];
}