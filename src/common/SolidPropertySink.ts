import { DataFrame, PushOptions, SinkNode, SinkNodeOptions } from '@openhps/core';
import { FeatureOfInterest, IriString, ObservableProperty, Observation, Property } from '@openhps/rdf';
import { SolidPropertyService } from './SolidPropertyService';
import { SolidSession } from './SolidService';

/**
 * Solid property sink is a sink node that writes data to a Solid pod.
 *  This sink node is used together with [[SolidPropertyService]] to initialize and
 *  store data in a Solid pod.
 * 
 * ## Usage
 * 
 * ```typescript
        ModelBuilder.create()
            .addService(new SolidPropertyService((node) => {
                return node.collection ? node.collection.members.length < 50 : true;
            }))
            .addService(new SolidClientService({
                clientName: "OpenHPS",
                defaultOidcIssuer: "https://.../",
                clientId: process.env.clientId,
                clientSecret: process.env.clientSecret,
                autoLogin: true
            }))
            .from()
            .to(new SolidPropertySink({
                properties: [PropertyType.POSITION]
            }))
            .build();
 * ```
 */
export class SolidPropertySink<Out extends DataFrame> extends SinkNode<Out> {
    protected options: SolidPropertySinkOptions;
    protected service: SolidPropertyService;

    constructor(options?: SolidPropertySinkOptions) {
        super(options);
        this.once('ready', this.onBuild.bind(this));
    }

    onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service = this.model.findService(SolidPropertyService);
            if (!this.service) {
                reject(new Error('No Solid session found'));
            }
            resolve();
        });
    }

    onPush(frame: Out | Out[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (Array.isArray(frame)) {
                Promise.all(frame.map((f) => this.writeFrame(f)))
                    .then(() => resolve())
                    .catch(reject);
            } else {
                this.writeFrame(frame)
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    }

    /**
     * Prepare the property for writing to the Solid pod.
     * @param property Property type
     * @param session Solid session
     */
    protected prepareProperty(property: PropertyType, session: SolidSession): Promise<IriString> {
        return new Promise<IriString>((resolve, reject) => {
            this.service.service
                .getDocumentURL(session, '/properties/')
                .then((propertiesURL) => {
                    // Create a new property
                    let promise: Promise<IriString>;
                    // Prepare properties
                    if (property === PropertyType.POSITION) {
                        const positionProperty = new Property((propertiesURL.href + 'position/') as IriString);
                        positionProperty.label = 'Position';
                        promise = this.service.createProperty(session, positionProperty);
                    }

                    promise.then(resolve).catch(reject);
                })
                .catch(reject);
        });
    }

    protected writeFrame(frame: Out): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let promises: Promise<any>[] = [];
            // Prepare properties
            for (const property of this.options.properties) {
                if (property === PropertyType.POSITION) {
                    promises.push(this.prepareProperty(property, this.service.session));
                }
            }

            Promise.all(promises)
                .then((results) => {
                    promises = [];
                    for (const dataObject of frame.getObjects()) {
                        // Write to properties
                        for (const [index, property] of this.options.properties.entries()) {
                            const observableProperty = new ObservableProperty(results[index]);
                            const observation = new Observation(`_:${frame.createdTimestamp}`);
                            observation.resultTime = new Date(frame.createdTimestamp);
                            observation.observedProperties = [observableProperty];
                            if (dataObject.webId) {
                                observation.featuresOfInterest = [new FeatureOfInterest(dataObject.webId)];
                            }

                            if (property === PropertyType.POSITION) {
                                observation.results = [dataObject.position];
                            }

                            // Write observation
                            promises.push(
                                this.service.addObservation(this.service.session, observableProperty, observation),
                            );
                        }
                    }

                    return Promise.all(promises);
                })
                .then(() => resolve())
                .catch(reject);
        });
    }
}

export enum PropertyType {
    POSITION,
}

export interface SolidPropertySinkOptions extends SinkNodeOptions {
    properties?: PropertyType[];
}
