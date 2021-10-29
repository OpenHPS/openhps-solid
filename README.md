<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/solid
</h1>
<p align="center">
    <a href="https://github.com/OpenHPS/openhps-solid/actions/workflows/main.yml" target="_blank">
        <img alt="Build Status" src="https://github.com/OpenHPS/openhps-solid/actions/workflows/main.yml/badge.svg">
    </a>
    <a href="https://codecov.io/gh/OpenHPS/openhps-solid">
        <img src="https://codecov.io/gh/OpenHPS/openhps-solid/branch/master/graph/badge.svg"/>
    </a>
    <a href="https://codeclimate.com/github/OpenHPS/openhps-solid/" target="_blank">
        <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/OpenHPS/openhps-solid">
    </a>
    <a href="https://badge.fury.io/js/@openhps%2Fsolid">
        <img src="https://badge.fury.io/js/@openhps%2Fsolid.svg" alt="npm version" height="18">
    </a>
</p>

<h3 align="center">
    <a href="https://github.com/OpenHPS/openhps-core">@openhps/core</a> &mdash; <a href="https://openhps.org/docs/solid">API</a>
</h3>

<br />

Solid is a specification that lets people store their data securely in decentralized data stores called Pods. Pods are like secure personal web servers for your data. OpenHPS leverages Solid to store ```DataObjects```. The idea is that ```DataObjects``` belonging to a certain person will be stored in the decentralized pod owned by that user. Not only does this provide more awareness of what positioning models are tracking you - it also offers a common interface for handing over a position to other positioning systems.

## Scenario
*The trajectory of a user is tracked outdoors using Google Maps that stores information in the Pod of the user (instead of the current Google Timeline). When
a user enters a building that uses an indoor positioning system, the Pod can be accessed and updated with a more accuracte position.*

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/solid with the following command.
```bash
npm install @openhps/solid --save
```

## Usage

### Logging in
Users are expected to log in on the client (browser) on their Pod provider.

### Creating a Solid ```DataObject```

```typescript
import { SolidDataObject } from '@openhps/solid';

const user = new SolidDataObject("");
```

In most cases a user might own a set of devices that are represented as ```DataObject```s in OpenHPS. This can easily be specified by setting
the parent of those objects to the UID of the ```SolidDataObject``` created for a user. Any object that is hierarchically connected
to a ```SolidDataObject``` will be stored in a Pod beloning to the user.

```typescript
import { CameraObject } from '@openhps/video';
import { DataObject } from '@openhps/core';
import { SolidDataObject } from '@openhps/solid';

const user = new SolidDataObject("");

// Hierarchical connected data objects
const phone = new DataObject();             // Phone with random UID
phone.parentUID = user.uid;
const camera = new CameraObject();          // Camera with random UID
camera.parentUID = phone.uid;
```

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2021 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.