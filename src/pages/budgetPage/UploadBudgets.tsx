import React from "react";
import "../../styles/components.css";
import {DownloadBudgetTemplate} from "./DownloadBudgetTemplate";
import {UploadCSVBudget} from "./UploadCSVBudget";


export function UploadBudgets() {


    return (
        <div className="componenets-wrapper-flex">
            <div className="component-wrapper">
                {/* Information */}
                <p>How to upload budgets:</p>
                <ol>
                    <li>Select the brand</li>
                    <li>Select the season</li>
                    <li>Select the type</li>
                    <li>Download the template</li>
                    <li>Open a new excel workbook. Click the "Data" tab then "Get Data". Select the CSV option and select your downloaded template</li>
                    <li>Fill only the "amount" column in the template</li>
                    <li>Save the file as a CSV. Make sure to only have one sheet in the workbook before saving</li>
                    <li>Upload the file</li>
                </ol>
            </div>
            <div className="component-wrapper">
                {/* download file */}
                <h4 style={{textAlign:"initial"}}>Download template</h4>
                <DownloadBudgetTemplate/>
            </div>
            <div className="component-wrapper">
                {/* upload file */}
                <h4 style={{textAlign:"initial"}}>Upload budget</h4>
                <UploadCSVBudget/>
            </div>
            <div className="component-wrapper">
                {/* preview file */}
                <p>Here the uploaded CSV file will be displayed before submitting</p>

            </div>
        </div>
    );
}