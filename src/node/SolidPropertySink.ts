import { DataFrame, PushOptions, SinkNode, SinkNodeOptions } from '@openhps/core';
import { IriString, Property } from '@openhps/rdf';
import { SolidPropertyService, SolidService, SolidSession } from '../common';

/**
 * Solid property sink is a sink node that writes data to a Solid pod.
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
     * @param session Solid session
     */
    protected prepareProperty(session: SolidSession): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Create a new property
            const promises: Promise<IriString>[] = [];
            // Prepare properties
            for (const property of this.options.properties) {
                if (property === PropertyType.POSITION) {
                    const positionProperty = new Property();
                    positionProperty.label = 'Position';
                    promises.push(this.service.createProperty(session, positionProperty));
                } else if (property === PropertyType.VELOCITY) {
                    const velocityProperty = new Property();
                    velocityProperty.label = 'Velocity';
                    promises.push(this.service.createProperty(session, velocityProperty));
                } else if (property === PropertyType.ORIENTATION) {
                    const orientationProperty = new Property();
                    orientationProperty.label = 'Orientation';
                    promises.push(this.service.createProperty(session, orientationProperty));
                }
            }

            Promise.all(promises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    protected writeFrame(frame: Out): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let promises: Promise<void>[] = [];
            // Prepare properties
            for (const property of this.options.properties) {
                if (property === PropertyType.POSITION) {
                    promises.push(this.prepareProperty(this.service.session));
                } else if (property === PropertyType.VELOCITY) {
                    promises.push(this.prepareProperty(this.service.session));
                } else if (property === PropertyType.ORIENTATION) {
                    promises.push(this.prepareProperty(this.service.session));
                }
            }

            Promise.all(promises)
                .then(() => {
                    promises = [];
                    for (const dataObject of frame.getObjects()) {
                        // Write to properties
                        for (const property of this.options.properties) {
                            if (property === PropertyType.POSITION) {
                                console.log('Position');
                            } else if (property === PropertyType.VELOCITY) {
                                console.log('Velocity');
                            } else if (property === PropertyType.ORIENTATION) {
                                console.log('Orientation');
                            }
                        }
                    }
                })
                .catch(reject);
        });
    }
}

export enum PropertyType {
    POSITION,
    VELOCITY,
    ORIENTATION,
}

export interface SolidPropertySinkOptions extends SinkNodeOptions {
    properties?: PropertyType[];
}
