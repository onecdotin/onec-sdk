import "babel-polyfill";
// var constants = require("../constants");
import * as constants from "../constants";
import axios from 'axios';
// var axios = require('axios');

const ONEC_AUTH_USERS_BASE_URL = constants.ONEC_NAAS_BASE_URL

class naas {
    constructor(api_key) {
        this.api_key = api_key;
    }

    async mintNFT(data) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}mintNFT/`
        const resData = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async mintRefNFT(data) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}mintRefNFT/`
        const resData = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async checkMintStatus(txn_tracker) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}checkMintStatus/${txn_tracker}/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async fetchTokenID(nft_id) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}fetchTokenId/${nft_id}/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async fetchRefTokenID(refnft_id) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}fetchRefTokenId/${refnft_id}/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async getTokenMetadataHash(token_id) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}getTokenMetadataHash/${token_id}/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async getRefNFTs(parent_id) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}getRefNFTs/${parent_id}/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async getIpfsFiles() {
        const url = `${ONEC_AUTH_USERS_BASE_URL}ipfsFile/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async uploadIpfsFiles(files) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}ipfsFile/`
        const resData = await axios.post(url, files, {
            headers: {
                "Content-Type": "multipart/form-data",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async getIpfsMetaData() {
        const url = `${ONEC_AUTH_USERS_BASE_URL}ipfsMetaData/`
        const resData = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    async uploadIpfsMetaData(data) {
        const url = `${ONEC_AUTH_USERS_BASE_URL}ipfsMetaData/`
        const resData = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "NAAS-APIKEY": this.api_key
            }
        })
            .then((response) => {
                return response.data;
            })

        return resData
    }

    verifyKey() {
        return this.api_key
    }
}

// module.exports = {
//     naas
// }
export {
    naas
}