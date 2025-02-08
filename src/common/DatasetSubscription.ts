import { RDFSerializer } from '@openhps/rdf';
import { EventEmitter } from 'events';
import WebSocket from 'isomorphic-ws';
import { Activity, ActivityAdd } from '../models';
import { IriString } from '@inrupt/solid-client';

/**
 * Solid Dataset subscription
 */
export class DatasetSubscription extends EventEmitter {
    private _ws: WebSocket;

    private constructor() {
        super();
    }

    /**
     * Create a new dataset subscription
     * @param {string} websocketUri  Websocket URI
     * @param {IriString} [channelType]  Channel type
     * @returns {Promise<DatasetSubscription>}      Dataset subscription
     */
    static create(websocketUri: string, channelType?: IriString): Promise<DatasetSubscription> {
        return new Promise((resolve) => {
            const subscription = new DatasetSubscription();
            subscription._ws = new WebSocket(websocketUri, ['solid-0.1']);
            subscription._ws.onopen = () => {
                resolve(subscription);
            };

            if (channelType) {
                subscription._ws.onmessage = (msg: MessageEvent) => {
                    subscription.emit('message', msg.data);
                    try {
                        // Deserialize message (activity stream)
                        RDFSerializer.deserializeFromJSONLD(undefined, JSON.parse(msg.data))
                            .then((activity) => {
                                if (activity) {
                                    subscription.emit('activity', activity);
                                } else {
                                    subscription.emit('error', new Error('Failed to deserialize activity stream'));
                                }
                            })
                            .catch((error) => {
                                subscription.emit('error', error);
                            });
                    } catch (error) {
                        subscription.emit('error', error);
                    }
                };
            } else {
                // Legacy
                subscription._ws.onmessage = (msg: any) => {
                    if (msg.data && msg.data.slice(0, 3) === 'pub') {
                        const activity = new ActivityAdd();
                        activity.object = msg.data.substring(3);
                        subscription.emit('activity', activity);
                    }
                };
            }

            subscription._ws.onerror = (e: any) => {
                subscription.emit('error', e);
            };
        });
    }

    /**
     * Subscribe to a dataset
     * @param {string} uri  Dataset URI
     */
    subscribe(uri: string): void {
        this._ws.send(`sub ${uri}`);
    }

    /**
     * Close the subscription
     */
    close(): void {
        if (this._ws) {
            this._ws.close();
        }
    }

    /**
     * Listen to raw message events
     * @param event
     * @param listener
     * @returns
     */
    on(event: 'message', listener: (msg: any) => void): this;
    on(event: 'activity', listener: (activity: Activity) => void): this;
    on(event: string, listener: (msg: any) => void): this {
        return super.on(event, listener);
    }
}
