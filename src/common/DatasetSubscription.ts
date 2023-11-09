import { EventEmitter } from 'events';
import * as WebSocket from 'isomorphic-ws';

/**
 * Solid Dataset subscription
 */
export class DatasetSubscription extends EventEmitter {
    private _ws: WebSocket;

    private constructor() {
        super();
    }

    static create(websocketUri: string): Promise<DatasetSubscription> {
        return new Promise((resolve) => {
            const subscription = new DatasetSubscription();
            subscription._ws = new WebSocket(websocketUri, ['solid-0.1']);
            subscription._ws.onopen = () => {
                resolve(subscription);
            };

            subscription._ws.onmessage = (msg: any) => {
                if (msg.data && msg.data.slice(0, 3) === 'pub') {
                    subscription.emit('update', msg.data.substring(3));
                }
            };

            subscription._ws.onerror = (e: any) => {
                subscription.emit('error', e);
            };
        });
    }

    subscribe(uri: string): void {
        this._ws.send(`sub ${uri}`);
    }

    close(): void {
        if (this._ws) {
            this._ws.close();
        }
    }
}
