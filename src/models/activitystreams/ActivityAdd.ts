import { SerializableObject } from '@openhps/core';
import { activitystreams } from '../../terms';
import { Activity } from './Activity';

@SerializableObject({
    rdf: {
        type: activitystreams.Add,
    },
})
export class ActivityAdd extends Activity {}
