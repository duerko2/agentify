import {auth} from "../firebase/firebase";
import {Agency} from "../types/Types";
import {useAgency} from "../firebase/AgencyContext";



export async function getAgencyByUserID(userID: string, setAgency: (agency: Agency) => void ): Promise<Agency | undefined> {
    try {
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

        const response = await fetch(`http://localhost:8082/agencies/${userID}`, requestOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch agency: ${response.statusText}`);
        }

        const agency = await response.json() as Agency;

        // Log the agency to see if it's correctly fetched
        console.log('Fetched agency:', agency);

        if (agency) {
            // Log the agency to the console
            console.log('Agency persisted:', agency);
            setAgency(agency);
        } else {
            console.log('No agency found for this user.');
        }

        return agency;

    } catch (error) {
        console.error('Error fetching agency:', error);
        return undefined; // Return undefined in case of an error
    }
}
