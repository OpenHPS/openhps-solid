import { createThing } from '@inrupt/solid-client';
import { RDFSerializer } from '@openhps/rdf';
import { SolidClientService } from '@openhps/solid';

const service = new SolidClientService({
  clientName: "Test",
});

service.interactiveLogin("https://solidweb.org").then((session) => {
  const datasetUri = service.getDocumentURL(session, "/properties/test.ttl").href;
  service.getThing(session, datasetUri).then(thing => {
    console.log(thing)
    if (thing !== null) {
      console.log("Deleting test...");
      return service.deleteDataset(session, datasetUri);
    }
    return Promise.resolve();
  }).then(() => {
    
  }).then(() => {
      console.log("created");
  }).catch(console.error);
});
