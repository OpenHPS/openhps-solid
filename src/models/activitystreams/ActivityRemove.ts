import { SerializableObject } from '@openhps/core';
import { activitystreams } from '../../terms';
import { Activity } from './Activity';

@SerializableObject({
    rdf: {
        type: activitystreams.Remove,
    },
})
export class ActivityRemove extends Activity {}
