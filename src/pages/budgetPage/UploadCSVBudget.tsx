import React, {useState} from "react";
import {useCSVReader } from 'react-papaparse';
import {addDoc, collection, doc, writeBatch} from "firebase/firestore";
import {auth, db} from "../../firebase/firebase";


export function UploadCSVBudget() {
    const {CSVReader} = useCSVReader();
    const [data,setData] = useState<{ customerID: string; customerName: string; seasonID: string; seasonName: string; brandID: string; brandName: string; orderType: string; currency: string ; amount: string; }[]>([]);

    const handleOnSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if(auth.currentUser) {


            const uid = auth.currentUser.uid;

            const batch = writeBatch(db);

            data.forEach((budget) => {
                console.log(budget);
                const documentRef = doc(db,'budget',budget.brandID+'_'+budget.customerID+'_'+budget.seasonID+'_'+budget.orderType);

                const payload = {
                    amount: parseInt(budget.amount.toString()),
                    brand: doc(db,'brand/'+budget.brandID),
                    customer: doc(db,'customer/'+budget.customerID),
                    season: doc(db,'season/'+budget.seasonID),
                    type: budget.orderType,
                    uid: uid,
                }

                batch.set(documentRef, payload);
            });

            batch.commit();
        }
    };


    return (
        <div>
        <CSVReader
        config={{
            header: true,
            skipEmptyLines: true,

        }}
        onUploadAccepted={(results:Papa.ParseResult<any>) => {
            const budgets = results.data as { customerID: string; customerName: string; seasonID: string; seasonName: string; brandID: string; brandName: string; orderType: string; currency: string ; amount: string; }[];
            setData(budgets);
        }}
    >
        {({
              getRootProps,
              acceptedFile,
              ProgressBar,
              getRemoveFileProps,
          }: any) => (
            <>
                <div>
                    <button type='button' {...getRootProps()}>
                        Select file
                    </button>
                    <div>
                        {acceptedFile && acceptedFile.name}
                    </div>
                    {acceptedFile &&
                    <button {...getRemoveFileProps()}>
                        Remove file
                    </button>
                    }
                </div>
                <ProgressBar/>
                {acceptedFile &&
                    <button
                        onClick={(e) => {
                            handleOnSubmit(e);
                        }}
                    >
                        Submit Budgets
                    </button>
                }
            </>
        )}
    </CSVReader>
        </div>
    );
}