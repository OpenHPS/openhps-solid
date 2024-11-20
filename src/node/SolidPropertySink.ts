import { DataFrame, PushOptions, SinkNode, SinkNodeOptions } from '@openhps/core';
import { Property } from '@openhps/rdf';
import { SolidSession } from '../common';

/**
 * Solid property sink is a sink node that writes data to a Solid pod.
 */
export class SolidPropertySink<Out extends DataFrame> extends SinkNode<Out> {
    protected options: SolidPropertySinkOptions;

    constructor(options?: SolidPropertySinkOptions) {
        super(options);
    }

    onPush(frame: Out | Out[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (Array.isArray(frame)) {
                Promise.all(frame.map((f) => this.writeProperty(f)))
                    .then(() => resolve())
                    .catch(reject);
            } else {
                this.writeProperty(frame)
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    }

    protected prepareProperty(session: SolidSession): Promise<void> {
        return new Promise<void>((resolve, reject) => {});
    }

    protected writeProperty(frame: Out): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            for (const dataObject of frame.getObjects()) {
                for (const property of this.options.properties) {
                    if (property === PropertyType.POSITION) {
                        // Write position
                        const position = dataObject.getPosition();
                        if (position) {
                            // Write position to Solid pod
                        }
                    } else if (property === PropertyType.VELOCITY) {
                        // Write velocity
                        const velocity = dataObject.getPosition().velocity;
                        if (velocity) {
                            // Write velocity to Solid pod
                        }
                    } else if (property === PropertyType.ORIENTATION) {
                        // Write orientation
                        const orientation = dataObject.getPosition().orientation;
                        if (orientation) {
                            // Write orientation to Solid pod
                        }
                    }
                }
            }
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
