import { SolidClientService, SolidPropertyService, SolidSession } from '../../src';
require('dotenv').config();

let session: SolidSession;
const clientService = new SolidClientService({
    clientName: "OpenHPS",
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
});

const service = new SolidPropertyService();
console.log("Logging in...");
clientService.login("https://solid.maximvdw.be/").then(s => {
    session = s;
    console.log("Building service...");
    return service.emitAsync('build');
}).then(() => {
    service.service = clientService;
    console.log("Deleting test property...");
    return service.service.deleteRecursively(session, "https://solid.maximvdw.be/properties/test/");
}).then(() => {
    console.log("Logging out...");
    return clientService.logout(session);
}).then(() => {
    console.log("Done!");
    process.exit(0);
}).catch(console.error);
