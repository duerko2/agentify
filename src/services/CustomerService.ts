import {auth, db} from "../firebase/firebase";
import {useAgency} from "../firebase/AgencyContext";
import {Agency, Customer} from "../types/Types";

export type NewCustomerDTO = {
    address: string;
    city: string;
    country: string;
    zipCode: string;
    brandIds: string[];
    email: string;
    name: string;
}




export function createCustomer(data: NewCustomerDTO) {
    const { agency } = useAgency();
    const agencyId = agency?.agencyId;
    if (!agencyId) {
        return;
    }

    auth.currentUser?.getIdToken().then((token) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(data)
        }
        fetch('http://localhost:8081/agencies/' + agencyId + '/customers', requestOptions).catch((error) => console.log(error));
    });
}

export async function getAllCustomers(agency: Agency | null): Promise<Array<Customer> | undefined> {
    const agencyId = agency?.agencyId;
    if (!agencyId) {
        return;
    }

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('Failed to get token.');
    }

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };


    const response = await fetch('http://localhost:8081/agencies/' + agencyId + '/customers', requestOptions);
    const customers = await response.json();
    console.log('Fetched customers:', customers);
    const customersArray = customers as { customers: Customer[]};
    console.log('Fetched customers:', customersArray.customers);
    return customersArray.customers;
}