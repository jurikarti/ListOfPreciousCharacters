
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

const roll = new DiceRoll("2d6 + 1");
console.log(JSON.stringify(roll, null, 2));

const roll2 = new DiceRoll("2d6");
console.log(JSON.stringify(roll2, null, 2));
