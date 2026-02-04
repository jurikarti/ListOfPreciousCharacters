
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

const roll = new DiceRoll("2d6");
// rolls[0] is the group
const group = roll.rolls[0];

console.log("Group Type:", group.constructor.name);
console.log("Group Sides:", group.sides); // Check direct property

if (group.rolls) {
    console.log("Inner roll 0 type:", group.rolls[0].constructor.name);
    console.log("Inner roll 0 sides:", group.rolls[0].sides);
    console.log("Inner roll 0 die sides:", group.rolls[0].die ? group.rolls[0].die.sides : "No die prop");
}
