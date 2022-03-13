import { withWalletConnect, withMetamask } from "./web/AuthUtils/WalletAuth";
import { naas } from "./client/onec-client";

const auth = {
    withMetamask,
    withWalletConnect
}

export default {
    auth,
    naas
}