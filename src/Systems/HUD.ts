import ammo from "../Assets/ammo.png";
import { Signal } from "../../_SqueletoECS/Signals";
import { log } from "console";

//temp demonstration variables
let expdir = "up",
  healthdir = "down",
  ammodir = "down";
let animationdelay = 15,
  currentAnimTik = 0,
  realElapsedTime = 0;
let objectiveTick = 0;
let objectiveDelay = 25;
let objectivesStep = 0;
let objectives = ["Clear Out Generators", "Defeat 50 enemeies", "Collect 5 items", "Survive 3 Minutes", "Some other objective"];

export class HUD {
  HUDdata = {
    elapsedTime: 0,
    get getFormatTime() {
      let sec_num = this.elapsedTime; // don't forget the second param
      let hours = Math.floor(sec_num / 3600);
      let minutes = Math.floor((sec_num - hours * 3600) / 60);
      let seconds = sec_num - hours * 3600 - minutes * 60;
      let minString, secString;
      if (minutes < 10) {
        minString = `0${minutes}`;
      } else minString = `${minutes}`;
      if (seconds < 10) {
        secString = `0${seconds}`;
      } else secString = `${seconds}`;
      return `${minString}:${secString}`;
    },
    enemiesDefeated: 0,
    generatorsRemaining: 6,
    itemsCollected: 0,
    currentHealth: 75,
    maxHealth: 100,
    exp: 55,
    toNex: 100,
    get percentHealth() {
      let percent = parseInt(((this.currentHealth / this.maxHealth) * 100).toFixed(2));
      if (percent >= 100) return 100;
      else return percent;
    },
    get percentExp() {
      let percent = parseInt(((this.exp / this.toNex) * 100).toFixed(2));
      if (percent >= 100) return 100;
      else return percent;
    },
    ammo: 12,
    get ammoArray() {
      let amAry: Array<object> = [];
      for (let index = 0; index < this.ammo; index++) {
        amAry.push({
          id: index,
          ammo: "ammo",
        });
      }
      return amAry;
    },
    objectives: [{ id: 0, text: "Clear Out Generators", css: "" }],
  };

  public template = `
    <style>
        HUD-template{
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0px;
            left: 0px;
        }

        status-bars{
            position: fixed;
            inset: 20% 90% 15% 2%;
            display: flex;
            justify-content: flex-start;
            gap:3px;
            align-items: end;
        }

        exp-bars, 
        health-bars{
            position: relative;
            width: 20%;
            height: 100%;
            
        }

        exp-next{
            position:absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: 100%;
            border: 1px solid white;
            border-radius: 3px;
            background-color: grey;
        }

        exp-current{
            position:absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: \${HUDdata.percentExp}%;
            border: 1px solid white;
            border-radius: 3px;
            background-color: CornflowerBlue;
            transition: height 0.1s linear;
        }

        health-max{
            position:absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: 100%;
            border: 1px solid white;
            border-radius: 3px;
            background-color: grey;
        }

        health-current{
            position:absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: \${HUDdata.percentHealth}%;
            border: 1px solid white;
            border-radius: 3px;
            background-color: red;
            transition: height 0.1s linear;
        }

        ammo-level  {
            position: fixed;
            inset: 20% 90% 15% 8%;
            display: flex;
            flex-direction: column-reverse;
            justify-content: flex-start;
            align-items: center;
        }

        ammo-case{
            position: relative;
            width: 8px;
            height: 12px;
            background-image: url(${ammo});
            background-repeat: no-repeat;
            background-size: cover;
            transform: rotate(90deg);
        }

        mission-objectives{
            position: fixed;
            top: 20%;
            right: 1%;
            width: 15%;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap:1px;
            align-items: flex-start;
            font-size: 6px;
            opacity: .65;
        }

        objective-tite{
            text-decoration: underline;
            font-style: italic;
            font-weight: bolder;
        }

        object-ive{
            font-style: italic;
        }

        .completed{
            text-decoration:  line-through;
        }

        HUD-data{
            position: fixed;
            inset: 0.5% 5% 95% 5%;
            border: 1px solid white;
            border-radius: 5000px;
            font-size: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 5px;
            padding-right: 5px;
        }
        kill-count,
        elapsed-time,
        generators-remaining,
        items-collected{
            flex-grow: 0;
            flex-shrink:0;
            flex-basis: 55px;
        }


    </style>
    <HUD-template>        
        <status-bars>
            <exp-bars>
                <exp-next></exp-next>
                <exp-current></exp-current>
            </exp-bars>
            <health-bars>
                <health-max></health-max>
                <health-current></health-current>
            </health-bars>
        </status-bars>
        <ammo-level>
            <ammo-case \${ammo<=*HUDdata.ammoArray:id}></ammo-case>
        </ammo-level>
        <HUD-data>
            <kill-count>Enemies Defeated: \${HUDdata.enemiesDefeated}</kill-count>
            <elapsed-time>Elapsed: \${HUDdata.getFormatTime}</elapsed-time>
            <generators-remaining>Generators Left: \${HUDdata.generatorsRemaining}</generators-remaining>
            <items-collected>Items Collected: \${HUDdata.itemsCollected}</items-collected>
        </HUD-data>
        <mission-objectives>
            <objective-tite>Objetives</objective-tite>
            <object-ive \${obj<=*HUDdata.objectives} class="\${obj.css}">\${obj.text}</<object-ive>
        </mission-objectives>
    </HUD-template>
      `;

  constructor() {
    //set up defaults
  }

  static create() {
    return new HUD();
  }

  update(deltaTime: number) {
    //make experience bars bounce
    if (expdir == "up") {
      this.HUDdata.exp++;
      if (this.HUDdata.exp == this.HUDdata.toNex) {
        expdir = "down";
      }
    } else {
      this.HUDdata.exp--;
      if (this.HUDdata.exp == 0) expdir = "up";
    }

    //make experience bars bounce
    if (healthdir == "up") {
      this.HUDdata.currentHealth++;
      if (this.HUDdata.currentHealth == this.HUDdata.maxHealth) {
        healthdir = "down";
      }
    } else {
      this.HUDdata.currentHealth--;
      if (this.HUDdata.currentHealth == 0) healthdir = "up";
    }

    currentAnimTik++;
    if (currentAnimTik >= animationdelay) {
      currentAnimTik = 0;
      //make experience bars bounce
      if (ammodir == "up") {
        this.HUDdata.ammo++;
        if (this.HUDdata.ammo == 12) {
          ammodir = "down";
        }
      } else {
        this.HUDdata.ammo--;
        if (this.HUDdata.ammo == 0) ammodir = "up";
      }

      this.HUDdata.enemiesDefeated = Math.floor(Math.random() * 50);
      this.HUDdata.generatorsRemaining = Math.floor(Math.random() * 10);
      this.HUDdata.itemsCollected = Math.floor(Math.random() * 20);
    }
    realElapsedTime += deltaTime * 1000;
    this.HUDdata.elapsedTime = Math.floor(realElapsedTime);

    objectiveTick++;
    if (objectiveTick >= objectiveDelay) {
      objectiveTick = 0;
      objectivesStep++;
      if (objectivesStep == 12) objectivesStep = 0;

      switch (objectivesStep) {
        case 0:
          this.HUDdata.objectives = [{ id: 0, text: objectives[0], css: "" }];
          break;
        case 1:
          this.HUDdata.objectives.push({ id: 1, text: objectives[1], css: "" });
          break;
        case 2:
          this.HUDdata.objectives.push({ id: 2, text: objectives[2], css: "" });
          break;
        case 3:
          this.HUDdata.objectives.push({ id: 3, text: objectives[3], css: "" });
          break;
        case 4:
          this.HUDdata.objectives[0].css = "completed";
          break;
        case 5:
          this.HUDdata.objectives[1].css = "completed";
          break;
        case 6:
          this.HUDdata.objectives[2].css = "completed";
          break;
        case 7:
          this.HUDdata.objectives[3].css = "completed";
          break;
        case 8:
          this.HUDdata.objectives.splice(3, 1);
          break;
        case 9:
          this.HUDdata.objectives.splice(2, 1);
          break;
        case 10:
          this.HUDdata.objectives.splice(1, 1);
          break;
        case 11:
          this.HUDdata.objectives.splice(0, 1);
          break;

        default:
          this.HUDdata.objectives = [];
          break;
      }
    }
  }
}
