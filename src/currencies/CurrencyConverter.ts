//
export async function currencyConverter(baseCurrency: string, endCurrencies: string[]) : Promise<{data: {[p: string]: number}}>{
    const key = "fca_live_sGOkGPrwH5VAFrX6ANwBI7kdzMtrpNTL1QAxGMqu";

    const BASE_URL = "https://api.freecurrencyapi.com/v1/latest";

    // https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_sGOkGPrwH5VAFrX6ANwBI7kdzMtrpNTL1QAxGMqu&currencies=USD%2CCAD%2CGBP&base_currency=DKK

    const params = {
        "apike": key,
        "base_currency": baseCurrency,
        "currencies" : endCurrencies,
    }
    const url = BASE_URL.concat("?apikey=", params.apike, "&currencies=", params.currencies.join("%2C"), "&base_currency=", params.base_currency);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json() as {data:{
            [key: string]: number
            }};

        return data;

    } catch (error) {
        console.log(error);
        return {data: {}};
    }
}
export async function getCurrencies() : Promise<string[]>{


    const URL = "https://api.freecurrencyapi.com/v1/currencies?apikey=fca_live_sGOkGPrwH5VAFrX6ANwBI7kdzMtrpNTL1QAxGMqu&currencies="

    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json() as {
            data:{
                [key: string]:
                    {
                        symbol: string,
                        name: string,
                        symbol_native: string,
                        decimal_digits: number,
                        rounding: number,
                        code: string,
                        name_plural: string
                    }
            }
        };
        return Object.keys(data.data);
    } catch (error) {
        console.log(error);
        // return some default value corresponding to the data type above
        return ["USD","CAD", "GBP"];
    }

}