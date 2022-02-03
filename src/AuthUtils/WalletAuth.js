import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as constants from "../constants"

let ONEC_AUTH_USERS_BASE_URL = constants.ONEC_NAAS_BASE_URL;
let _mmConnector = null;
let _wcInitialized = false;
let _activeAccount = null;
let _chainId = null;
let _user = null;
let _wcConnector = null;
let _authMethod = null;
let _sessionId = null;

/**
 * 
 * @param {*} message Message to sign
 * @returns Promise returned by ethereum object injected by Metamask
 */

function ErrorHandler(error, reject) {
    let msg = '';
    if (error.code === 4001) {
        msg = 'Request rejected. Please accept to continue.';
    } else if (error.code === 4100) {
        msg = 'Account is inaccessible. Please unlock your account.';
    } else {
        msg = 'error: ' + error.message;
    }
    console.error(msg);
    return reject(new Error(msg));
}

function connectWC() {
    return new Promise(async (resolve, reject) => {
        if (!_wcConnector) {
            // Create a connector
            _wcConnector = new WalletConnect({
                bridge: 'https://bridge.walletconnect.org', // Required
                qrcodeModal: QRCodeModal,
            });
            if (!_wcConnector)
                return reject(new Error('Could not instantiate WalletConnect'));

            // Subscribe to connection events
            _wcConnector.on('connect', (error, payload) => {
                if (error) {
                    return reject(error);
                }

                // Get provided accounts and chainId
                _activeAccount = payload.params[0].accounts[0];
                _chainId = payload.params[0].chainId;
            });

            _wcConnector.on('session_update', (error, payload) => {
                if (error) {
                    return reject(error);
                }

                // Get updated accounts and chainId
                _activeAccount = payload.params[0].accounts[0];
                _chainId = payload.params[0].chainId;
            });

            _wcConnector.on('disconnect', (error, payload) => {
                if (error) {
                    return reject(error);
                }

                // Delete connector
                _user = null
                _chainId = null
                _wcConnector = null
                _activeAccount = null
            });
        }

        if (!_wcInitialized && _wcConnector.connected)
            await _wcConnector.updateSession({ chainId: _wcConnector.chainId, accounts: _wcConnector.accounts });

        // Check if connection is already established
        if (!_wcConnector.connected) {
            // create new session
            _wcConnector.connect().then(() => { resolve(_activeAccount) }).catch((error) => { reject(error) });
        } else {
            return resolve(_activeAccount);
        }
    });
}

function isLoggedIn() {
    if (_user && _sessionId && _activeAccount && _authMethod != null) {
        return true;
    } else {
        _user = null; _sessionId = null; _activeAccount = null; _authMethod = null;
        return false;
    }
}

function userLogin(resolve, reject) {
    axios.post(ONEC_AUTH_USERS_BASE_URL + 'init/' + _activeAccount + '/')
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                let message = response.data.message;
                _sessionId = response.data.session_id;
                if (_authMethod === 'metamask')
                    return window.ethereum.request({
                        method: 'personal_sign',
                        params: [message, window.ethereum.selectedAddress]
                    });
                else if (_authMethod == 'walletconnect') {
                    return _wcConnector.signPersonalMessage(['' + message, _activeAccount]);
                } else
                    return reject(new Error('Invalid auth attempt faced'));
            } else {
                return reject(new Error('Error in creating user session'));
            }
        }).then((_signature) => {
            // do user auth with signature on the session message
            return axios.post(ONEC_AUTH_USERS_BASE_URL + 'auth/' + _activeAccount + '/', {
                signature: _signature,
                session_id: _sessionId
            });
        }).then((response) => {
            if (response.status === 200) {
                console.log('User authenticated');
                _user = { user: response.data.user, token: response.data.token };
                return resolve(_user);
            } else if (response.status >= 400 && response.status < 500) {
                // User is not authenticated
                console.log('Something went wrong');
                reject(new Error(response.status + ': ' + response.statusText));
            } else if (response.status >= 500) {
                console.log('Server error');
                reject(new Error(response.status + ': ' + response.statusText));
            }
        }).catch((error) => { reject(error) });
}

export function withWalletConnect() {
    return new Promise((resolve, reject) => {
        if (isLoggedIn()) {
            if (_authMethod === 'walletconnect') {
                return resolve(_user);
            } else {
                console.warn('Overriding existing user session with new walletconnect session');
                _user = null; _sessionId = null; _activeAccount = null; _authMethod = null;
            }
        }
        _authMethod = 'walletconnect';
        connectWC().then(async (response) => {
            console.log(response);
            _wcInitialized = true;
            if (!response) {
                _activeAccount = (await _wcConnector.sendCustomRequest({ method: 'eth_accounts' }))[0];
                _chainId = await _wcConnector.sendCustomRequest({ method: 'eth_chainId' });
            }
            userLogin(resolve, reject);
        }).catch(error => { ErrorHandler(error, reject) });
    });
}

export function withMetamask() {
    return new Promise((resolve, reject) => {
        if (isLoggedIn()) {
            if (_authMethod === 'metamask') {
                return resolve(_user);
            } else {
                console.warn('Overriding existing user session with new metamask session');
                _user = null; _sessionId = null; _activeAccount = null; _authMethod = null;
            }
        }
        if (!_mmConnector)
            _mmConnector = new MetaMaskOnboarding();

        if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
            console.log('MetaMask is not installed');
            _mmConnector.startOnboarding();
            return resolve(null);
        }

        _authMethod = 'metamask';
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts) => {
                console.log('accounts', accounts);
                _activeAccount = accounts[0];
                userLogin(resolve, reject);
            }).catch((error) => { ErrorHandler(error, reject) });
    });
}