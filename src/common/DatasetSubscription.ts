import { RDFSerializer } from '@openhps/rdf';
import { EventEmitter } from 'events';
import WebSocket from 'isomorphic-ws';
import { Activity } from '../models';

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
     * @returns {Promise<DatasetSubscription>}      Dataset subscription
     */
    static create(websocketUri: string): Promise<DatasetSubscription> {
        return new Promise((resolve) => {
            const subscription = new DatasetSubscription();
            subscription._ws = new WebSocket(websocketUri, ['solid-0.1']);
            subscription._ws.onopen = () => {
                resolve(subscription);
            };

            subscription._ws.onmessage = (msg: MessageEvent) => {
                subscription.emit('message', msg.data);
                try {
                    // Deserialize message (activity stream)
                    // const activity = RDFSerializer.deserializeFromString(undefined, msg.data, 'application/ld+json');
                    // if (activity) {
                    //     subscription.emit('activity', activity);
                    // }
                    subscription.emit('activity', JSON.parse(msg.data));
                } catch (error) {
                    subscription.emit('error', error);
                }
            };

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
