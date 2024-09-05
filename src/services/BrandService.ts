import {Agency, Brand} from "../types/Types";
import {auth} from "../firebase/firebase";


export async function getAllBrands(agency: Agency | null): Promise<Array<Brand> | undefined> {
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

    const response = await fetch('http://localhost:8083/agencies/' + agencyId + '/brands', requestOptions);
    const brandsData = await response.json();
    console.log('Fetched brands:', brandsData);
    const brandsArray = brandsData as { brands: Brand[]};
    console.log('Fetched brands:', brandsArray.brands);
    return brandsArray.brands;
}