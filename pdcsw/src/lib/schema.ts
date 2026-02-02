import { z } from "zod";

// Схема для одного слота экипировки
const equipmentSlotSchema = z.object({
    name: z.string(),
    weight: z.coerce.number(),
    hit: z.coerce.number(),
    damage: z.string(),
    range: z.coerce.number(),
    evasion: z.coerce.number(),
    defense: z.coerce.number(),
    notes: z.string(),
});

// Схема для боевого параметра с проверкой
const combatStatSchema = z.object({
    check: z.string(),
    modifier: z.string(),
});

// Схема для одной из шести характеристик (новая, сложная структура)
const mainStatSchema = z.object({
    race: z.coerce.number(),
    bonus: z.coerce.number(),
    style: z.coerce.number(),
    element: z.coerce.number(),
    other: z.coerce.number(),
});

// 1. Основная схема персонажа
export const characterSchema = z.object({
    // Шапка
    image: z.string(),
    name: z.string(),
    playerName: z.string(),
    mentor: z.string(),
    level: z.coerce.number().min(1).max(10),
    exp: z.coerce.number(),

    // Жизненный путь
    origin: z.string(),
    secret: z.string(),
    future: z.string(),
    focusItem: z.string(),

    // Внешность
    age: z.string(),
    gender: z.string(),
    height: z.string(),
    hairColor: z.string(),
    eyeColor: z.string(),
    skinColor: z.string(),

    // Названия для таблицы характеристик
    raceName: z.string(),
    styleName: z.string(),
    elementName: z.string(),

    // Характеристики (новая структура)
    stats: z.object({
        body: mainStatSchema,
        intellect: mainStatSchema,
        mysticism: mainStatSchema,
        agility: mainStatSchema,
        passion: mainStatSchema,
        charisma: mainStatSchema,
    }),

    // Ресурсы
    hp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),
    mp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),
    wp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),

    // Боевые параметры
    combat: z.object({
        magicPower: combatStatSchema,
        evasion: combatStatSchema,
        defense: combatStatSchema,
        baseDamage: z.string(),
        enemyRecognition: combatStatSchema,
        evaluation: combatStatSchema,
    }),

    // Навыки
    skills: z.array(z.object({
        name: z.string(),
        value: z.coerce.number(),
        effect: z.string(),
    })),

    // Экипировка по слотам
    equipment: z.object({
        rightHand: equipmentSlotSchema,
        leftHand: equipmentSlotSchema,
        head: equipmentSlotSchema,
        body: equipmentSlotSchema,
        extraDefense: equipmentSlotSchema,
        magic: equipmentSlotSchema,
    }),

    // Зачарования
    enchantments: z.array(z.object({
        name: z.string(),
        effect: z.string(),
    })),

    // Инвентарь (рюкзак)
    inventory: z.array(z.object({
        name: z.string(),
        weight: z.coerce.number(),
    })).length(7),
    maxWeight: z.coerce.number(),

    // Связи
    connections: z.array(z.object({
        name: z.string(),
        relationType: z.string(),
    })),

    // Заметки
    notes: z.string(),
});

// 2. Выводим TypeScript тип из схемы.
export type CharacterData = z.infer<typeof characterSchema>;

const defaultStat = { race: 0, bonus: 0, style: 0, element: 0, other: 0 };

// 3. Определяем объект со значениями по умолчанию.
export const defaultCharacter: CharacterData = {
    image: "",
    name: "",
    playerName: "",
    mentor: "",
    level: 1,
    exp: 0,
    origin: "",
    secret: "",
    future: "",
    focusItem: "",
    age: "",
    gender: "",
    height: "",
    hairColor: "",
    eyeColor: "",
    skinColor: "",
    raceName: "Человек",
    styleName: "Заклинатель",
    elementName: "Ветер",
    stats: {
        body: { ...defaultStat },
        intellect: { ...defaultStat },
        mysticism: { ...defaultStat },
        agility: { ...defaultStat },
        passion: { ...defaultStat },
        charisma: { ...defaultStat },
    },
    hp: { current: 10, max: 10 },
    mp: { current: 10, max: 10 },
    wp: { current: 10, max: 10 },
    combat: {
        magicPower: { check: "2d6", modifier: "+0" },
        evasion: { check: "2d6", modifier: "+0" },
        defense: { check: "2d6", modifier: "+0" },
        baseDamage: "2D+",
        enemyRecognition: { check: "2d6", modifier: "+0" },
        evaluation: { check: "2d6", modifier: "+0" },
    },
    skills: [
        { name: "Приток маны", value: 0, effect: "Позволяет использовать магию." }
    ],
    equipment: {
        rightHand: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
        leftHand: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
        head: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
        body: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
        extraDefense: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
        magic: { name: "", weight: 0, hit: 0, damage: "", range: 0, evasion: 0, defense: 0, notes: "" },
    },
    enchantments: [],
    inventory: Array(7).fill({ name: "", weight: 0 }),
    maxWeight: 30,
    connections: [],
    notes: "<p>Заметки о персонаже...</p>",
};
