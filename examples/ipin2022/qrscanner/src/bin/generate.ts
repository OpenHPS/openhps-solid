import { SymbolicSpace } from '@openhps/geospatial';
import * as Spaces from '../models/Spaces';
import * as qr from 'qr-image';

Object.keys(Spaces).forEach(key => {
    const space = Spaces[key] as SymbolicSpace<any>;
    const image = qr.imageSync(space.uid, { type: 'svg' });
    console.log(image);
});