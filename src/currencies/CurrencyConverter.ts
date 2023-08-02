// : {endCurrency: string, amount: number}[]
export async function currencyConverter(baseCurrency: string, endCurrencies: string[]) {
    const key = "fca_live_sGOkGPrwH5VAFrX6ANwBI7kdzMtrpNTL1QAxGMqu";

    const BASE_URL = "https://api.freecurrencyapi.com/v1/latest";

    // https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_sGOkGPrwH5VAFrX6ANwBI7kdzMtrpNTL1QAxGMqu&currencies=USD%2CCAD%2CGBP&base_currency=DKK

    const params = {
        "apike": key,
        "base_currency": baseCurrency,
        "currencies" : endCurrencies,
    }
    const url = BASE_URL.concat("?apikey=", params.apike, "&currencies=", params.currencies.join("%2C"), "&base_currency=", params.base_currency);

    console.log(url);
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

        console.log(data);
    } catch (error) {
        console.log(error);
    }
}