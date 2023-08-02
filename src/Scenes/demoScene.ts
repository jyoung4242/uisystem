// Library
import { Scene } from "../../_SqueletoECS/Scene";
import { Vector } from "../../_SqueletoECS/Vector";
import { Engine } from "@peasy-lib/peasy-engine";

import { Camera, ICameraConfig } from "../../_SqueletoECS/Camera"; //this is in Squeleto library
import { HUD } from "../Systems/HUD";
import { TemplateComp } from "../Components/templateComponent";

// Entities
import { TemplateEntity } from "../Entities/entityTemplate";
/* *README*
  You will import all your  ECS entities for this scene here
  for example
  import { MapEntity } from "../Entities/mapEntity";
  import { DemoEntity } from "../Entities/demo";
*/
export class Test extends Scene {
  name: string = "test";
  entities: any = [];
  entitySystems: any = [];
  sceneSystems: any = [];
  public template = `
    <scene-layer>
        < \${ sceneSystem === } \${ sceneSystem <=* sceneSystems }
    </scene-layer>
  `;
  public init = (): void => {
    // add default entities to the array
    this.entities.push(TemplateEntity.create());
    let myHUD = HUD.create();
    //establish Scene Systems - Configuring Camera
    let cConfig: ICameraConfig = {
      name: "camera",
      viewPortSystems: [myHUD],
      gameEntities: this.entities,
      position: new Vector(0, 0),
      size: new Vector(400, 266.67),
    };
    let camera = Camera.create(cConfig);

    //Systems being added for Scene to own

    this.sceneSystems.push(camera);

    //Start GameLoop
    Engine.create({ fps: 60, started: true, callback: this.update });
  };

  //GameLoop update method
  update = (deltaTime: number): void | Promise<void> => {
    this.sceneSystems.forEach((system: any) => {
      system.update(deltaTime / 1000, 0, this.entities);
    });
  };
}
