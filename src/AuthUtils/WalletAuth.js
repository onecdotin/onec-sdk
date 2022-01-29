import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as constants from "../constants"

let ONEC_AUTH_USERS_BASE_URL = constants.ONEC_NAAS_BASE_URL;

let current
let _activeAccount = null
let _chainId = null
let _user = null
let _wcConnector = null
let _authMethod = null

/**
 * 
 * @param {*} message Message to sign
 * @returns Promise returned by ethereum object injected by Metamask
 */

function ErrorHandler(error, reject) {
    let msg = '';
    if (error.code === 4001) {
        // Request rejected. Please accept to continue.
        msg = 'Request rejected. Please accept to continue.';
    } else if (error.code === 4100) {
        // Account is inaccessible. Please unlock your account.
        msg = 'Account is inaccessible. Please unlock your account.';
    } else {
        msg = 'error: ' + error.message;
    }
    console.error(msg);
    reject(new Error(msg));
}

function connectWC() {
    return new Promise((resolve, reject) => {
        if (!_wcConnector) {
            // Create a connector
            _wcConnector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: QRCodeModal,
            });
            if (!_wcConnector)
                throw new Error("Could not instantiate WalletConnect");

            // Subscribe to connection events
            _wcConnector.on("connect", (error, payload) => {
                if (error) {
                    throw error;
                }

                // Get provided accounts and chainId
                _activeAccount = payload.params[0].accounts[0];
                _chainId = payload.params[0].chainId;
                console.log("connect", payload.params);
            });

            _wcConnector.on("session_update", (error, payload) => {
                if (error) {
                    throw error;
                }

                // Get updated accounts and chainId
                _activeAccount = payload.params[0].accounts[0];
                _chainId = payload.params[0].chainId;
                console.log("session", payload.params);
            });

            _wcConnector.on("disconnect", (error, payload) => {
                if (error) {
                    throw error;
                }

                // Delete connector
                _user = null
                _chainId = null
                _wcConnector = null
                _activeAccount = null
                axios.post(ONEC_AUTH_USERS_BASE_URL + 'logout/' + _activeAccount + '/');
                console.log("disconnect", payload.params);
            });
        }

        // if (!_activeAccount)
        //     _wcConnector.disconnect();

        // Check if connection is already established
        if (!_wcConnector.connected) {
            // create new session
            resolve(_wcConnector.connect());
            return;
        }
        resolve();
    });
}

function toHex(s) {
    // utf8 to latin1
    var s = unescape(encodeURIComponent(s))
    var h = ''
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

function userLogin(resolve, reject) {
    return axios.post(ONEC_AUTH_USERS_BASE_URL + 'init/' + _activeAccount + '/')
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                let message = response.data.message;
                if (_authMethod === "metamask")
                    return window.ethereum.request({
                        method: 'personal_sign',
                        params: [message, window.ethereum.selectedAddress]
                    });
                else if (_authMethod == "walletconnect") {
                    return _wcConnector.signPersonalMessage([toHex(message), _activeAccount]);
                } else
                    throw new Error("Invalid auth attempt faced");
            } else {
                throw new Error("Error in creating user session");
            }
        }).then((sig) => {
            // do user auth with signature on the session message
            return axios.post(ONEC_AUTH_USERS_BASE_URL + 'auth/' + _activeAccount + '/', {
                signature: sig
            });
        }).then((response) => {
            if (response.status === 200) {
                console.log('User authenticated');
                _user = { user: response.data.user, token: response.data.token };
                resolve(_user);
            } else if (response.status >= 400 && response.status < 500) {
                // User is not authenticated
                console.log('Something went wrong');
                throw new Error(response.status + ': ' + response.statusText);
            } else if (response.status >= 500) {
                console.log('Server error');
                throw new Error(response.status + ': ' + response.statusText);
            }
        });
}

export function withWalletConnect() {
    return new Promise((resolve, reject) => {
        _authMethod = "walletconnect";
        connectWC().then((response) => {
            console.log(response);
            userLogin(resolve, reject).catch((error) => { reject(error) });
        }).catch(error => { ErrorHandler(error, reject) });
    });
}

export function withMetamask() {
    if (!current) {
        current = new MetaMaskOnboarding();
        // window.ethereum.on('accountsChanged', function(accounts) {
        //     console.log('accountsChanged', accounts);
        // });
    }

    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
        console.log('MetaMask is not installed');
        current.startOnboarding();
        return;
    }

    return new Promise((resolve, reject) => {
        _authMethod = "metamask";
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(async (accounts) => {
                console.log('accounts', accounts);
                _activeAccount = accounts[0];
                userLogin(resolve, reject).catch((error) => { reject(error) });
            }).catch((error) => { ErrorHandler(error, reject) });
    });
} 