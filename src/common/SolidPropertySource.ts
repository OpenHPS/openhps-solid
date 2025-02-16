import { DataFrame, PullOptions, SourceNode, SourceNodeOptions } from '@openhps/core';
import { SolidPropertyService } from './SolidPropertyService';
import { PropertyType } from './SolidPropertySink';

export class SolidPropertySource extends SourceNode {
    protected options: SolidPropertySourceOptions;
    protected service: SolidPropertyService;

    constructor(options?: SolidPropertySourceOptions) {
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

    onPull(options?: PullOptions): Promise<DataFrame> {
        throw new Error('Method not implemented.');
    }
}

export interface SolidPropertySourceOptions extends SourceNodeOptions {
    properties?: PropertyType[];
}
