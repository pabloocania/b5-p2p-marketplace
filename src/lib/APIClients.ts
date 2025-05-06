import { P2PMarketplaceAPIClient } from "b5-api-client";

const p2pMarketAPIClient = new P2PMarketplaceAPIClient(
    process.env.NEXT_PUBLIC_KIOSCOIN_API_BASE ?? "https://bolsillo-argento-586dfd80364d.herokuapp.com"
);

export {
    p2pMarketAPIClient
};
