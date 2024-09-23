import { P2PMarketplaceAPIClient } from "b5-api-client";

const p2pMarketAPIClient = new P2PMarketplaceAPIClient(
    "https://bolsillo-argento-586dfd80364d.herokuapp.com"
);

export {
    p2pMarketAPIClient
};