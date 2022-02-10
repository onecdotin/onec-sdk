import fetch from "node-fetch";
import { withWalletConnect, withMetamask, ErrorHandler } from "./AuthUtils/WalletAuth";

const DJANGO_BASE_URL = "https://api.onec.in/api/v1/naas/"

class naas {
    constructor(api_key) {
        this.api_key = api_key;
    }

    async mintNFT(data) {
        const url = `${DJANGO_BASE_URL}mintNFT/`
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        }).then(async response => {
            const mintRes = await response.json()
            return mintRes
        })
        // const mintRes = await axios.post(url, data, {
        //     headers: {
        //         "Content-Type": "application/json",
        //         "NAAS-APIKEY": this.api_key
        //     }
        // })
        // .then((response) => {
        //     console.log(response)
        //     return response;
        // })

        // return mintRes
    }

    verifyKey() {
        return this.api_key
    }
}

const auth = {
    withMetamask,
    withWalletConnect
}

export default {
    auth,
    naas
}