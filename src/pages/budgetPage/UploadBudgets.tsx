import {ChangeEvent, useState} from "react";
import "../../styles/components.css";
import {DownloadBudgetTemplate} from "./DownloadBudgetTemplate";

export function UploadBudgets() {

    const [file, setFile] = useState<File>();

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        try {
            if(event.target.files){
                setFile(event.target.files[0]);
            }
        } catch (e){
            console.log("invalid file input")
        }
    }

    function handleOnSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        
    }

    return (
        <div className="componenets-wrapper-flex">
            <div className="component-wrapper">
                {/* download file */}
                <h4 style={{textAlign:"initial"}}>Download template</h4>
                <DownloadBudgetTemplate/>
            </div>
            <div className="component-wrapper">
                {/* upload file */}
                <h4 style={{textAlign:"initial"}}>Upload budget</h4>
                <form>
                    <input
                        type={"file"}
                        id={"csvFileInput"}
                        accept={".csv"}
                        onChange={handleOnChange}
                    />

                    <button
                        onClick={(e) => {
                            handleOnSubmit(e);
                        }}
                    >
                        IMPORT CSV
                    </button>
                </form>
            </div>
            <div className="component-wrapper">
                {/* Information */}
                <p>Information about downloading budget templates and uploading them</p>
            </div>
            <div className="component-wrapper">
                {/* preview file */}
                <p>Here the uploaded CSV file will be displayed before submitting</p>
            </div>
        </div>
    );
}