import {CustomerBrand} from "../types/Types";

export function BrandCard(props: { brand: CustomerBrand, onClick : (brand:CustomerBrand) => void }) {
    const { brand, onClick} = props;
    function onBrandCardClick() {
        onClick(brand);
    }
    return (
        <div className="brandCard" key={brand.id} onClick={onBrandCardClick}>
            <p>{brand.name}</p>
        </div>
    );
}