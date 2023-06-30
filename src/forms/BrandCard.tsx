import {CustomerBrand} from "../types/Types";
import CheckMark from '../assets/checkmark.png'

export function BrandCard(props: { brand: {brandDetails: CustomerBrand,chosen: boolean}, onClick : (brand:CustomerBrand) => void }) {
    const { brand, onClick} = props;
    function onBrandCardClick() {
        onClick(brand.brandDetails);
    }
    return (
        <div className={brand.chosen ? "brandCardChosen" : "brandCard"} key={brand.brandDetails.id} onClick={onBrandCardClick}>
            <p>{brand.brandDetails.name}</p>
            {brand.chosen && <img src={CheckMark} width="25" height="25"/>}
        </div>

    );
}