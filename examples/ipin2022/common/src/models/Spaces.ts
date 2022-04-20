import { Absolute2DPosition, GeographicalPosition } from "@openhps/core";
import { Building, Corridor, Floor, Room, Zone } from "@openhps/geospatial";

const building = new Building("Pleinlaan 9").setUID("b2af5743-be8d-4c4b-917f-6847fd75e41e")
    .setBounds({
        topLeft: new GeographicalPosition(
            50.8203726927966, 4.392241309019189
        ),
        width: 46.275,
        height: 37.27,
        rotation: -34.04
    });
const floor = new Floor("3").setUID("43c84b6a-dd84-47c8-9793-6a3a1233e359")
    .setBuilding(building)
    .setBounds([
        new Absolute2DPosition(0, 0),
        new Absolute2DPosition(0, 13.73),
        new Absolute2DPosition(10.102, 13.73),
        new Absolute2DPosition(10.102, 23.54),
        new Absolute2DPosition(0, 23.54),
        new Absolute2DPosition(0, 37.27),
        new Absolute2DPosition(44.33, 37.27),
        new Absolute2DPosition(44.33, 23.54),
        new Absolute2DPosition(28.06, 23.54),
        new Absolute2DPosition(28.06, 13.73),
        new Absolute2DPosition(44.33, 13.73),
        new Absolute2DPosition(44.33, 0),
    ])
    .setFloorNumber(3);
const office1 = new Room("3.60").setUID("b56bd257-8517-45bd-b893-2f64fd6fa0a7")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(0.57, 31.25),
        new Absolute2DPosition(4.75, 37.02),
    ]);
const office2 = new Room("3.58").setUID("d096153a-e052-41d4-ba72-2eb48c64be3f")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(4.75, 31.25),
        new Absolute2DPosition(8.35, 37.02),
    ]);
const office3 = new Room("3.56").setUID("566fd6fd-775b-430e-9242-5cc25e0fe1a1")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(8.35, 31.25),
        new Absolute2DPosition(13.15, 37.02),
    ]);
const office4 = new Room("3.32").setUID("07ea73b4-f050-4a11-995e-ca434ba2d473")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(29.97, 31.25),
        new Absolute2DPosition(34.77, 37.02),
    ]);
const lab = new Room("3.54").setUID("9930cc12-993a-4f59-904e-5104e84384b7")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(13.15, 31.25),
        new Absolute2DPosition(25.15, 37.02),
    ]);
const classroom = new Room("3.62").setUID("d25b66b2-0cf9-46c2-a776-947956f96de9")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(27.55, 24.105),
        new Absolute2DPosition(35.95, 29.5),
    ]);
const hallway = new Corridor("Corridor").setUID("60b42f87-b04d-43b7-a8ba-42c6e95fb38e")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(2.39, 6.015),
        new Absolute2DPosition(2.39, 7.715),
        new Absolute2DPosition(18.015, 7.715),
        new Absolute2DPosition(18.015, 29.555),
        new Absolute2DPosition(2.39, 29.555),
        new Absolute2DPosition(2.39, 31.255),
        new Absolute2DPosition(41.94, 31.255),
        new Absolute2DPosition(41.94, 29.555),
        new Absolute2DPosition(20.315, 29.555),
        new Absolute2DPosition(20.315, 7.715),
        new Absolute2DPosition(41.94, 7.715),
        new Absolute2DPosition(41.94, 6.015),
    ]);
const lobby = new Zone("Lobby - WISE Lab").setUID("dd34bff1-1f22-4fa8-b081-a6820cac1dda")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(20.315, 20.155),
        new Absolute2DPosition(25.765, 27.27)
    ]);
const lobby2 = new Zone("Lobby - AI Lab").setUID("82de43f2-d812-4f1d-bd8e-abc55a8ff248")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(18.015, 0.57),
        new Absolute2DPosition(20.315, 6.015)
    ]);
const toilet1 = new Zone("Toilets - WISE Lab").setUID("91e4cde9-3559-48ee-afee-51717516ffd6")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(15.48, 10.51),
        new Absolute2DPosition(18.015, 12.71),
    ]);
const toilet2 = new Zone("Toilets - AI Lab").setUID("c68852a9-89ea-4a1e-bdbc-5c6f14a44aef")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(15.48, 24.56),
        new Absolute2DPosition(18.015, 26.76),
    ]);
const elevators = new Corridor("Elevators").setUID("f55c0caf-4434-480f-a2e1-7514d048199c")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(10.73, 17.22),
        new Absolute2DPosition(18.02, 20.06),
    ]);
const stairs = new Corridor("Staircase").setUID("ca86da51-45d5-4860-a4b4-c6acdddff213")
    .setFloor(floor)
    .setBounds([
        new Absolute2DPosition(20.315, 17.22),
        new Absolute2DPosition(27.56, 20.06),
    ]);
export { 
    lobby, lobby2, hallway, 
    classroom, office1, office2, 
    office3, office4,  lab , building, floor,
    elevators, stairs, toilet1, toilet2
};
