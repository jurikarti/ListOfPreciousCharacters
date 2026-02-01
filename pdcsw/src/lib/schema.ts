import { z } from "zod";

// 1. Схема для валидации.
// Она описывает только ФОРМУ данных, без значений по умолчанию.
// Это гарантирует, что TypeScript выведет чистые и правильные типы.
export const characterSchema = z.object({
    image: z.string(),
    name: z.string(),
    playerName: z.string(),
    mentor: z.string(),
    level: z.coerce.number(),
    exp: z.coerce.number(),
    age: z.string(),
    gender: z.string(),
    height: z.string(),
    hairColor: z.string(),
    eyeColor: z.string(),
    skinColor: z.string(),
    origin: z.string(),
    secret: z.string(),
    future: z.string(),
    stats: z.object({
        body: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
        intellect: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
        mysticism: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
        agility: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
        senses: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
        charisma: z.object({ base: z.coerce.number(), bonus: z.coerce.number(), total: z.coerce.number(), image: z.string().optional(), name: z.string() }),
    }),
    hp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),
    mp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),
    wp: z.object({ current: z.coerce.number(), max: z.coerce.number() }),
    combat: z.object({ magicPower: z.coerce.number(), evasion: z.coerce.number(), defense: z.coerce.number() }),
    inventory: z.array(z.object({ slot: z.string(), name: z.string(), weight: z.coerce.number(), effect: z.string() })),
    notes: z.string(),
});

// 2. Выводим TypeScript тип из этой чистой схемы.
export type CharacterData = z.infer<typeof characterSchema>;

// 3. Определяем объект со значениями по умолчанию ОТДЕЛЬНО.
// Это конкретный объект, который используется для инициализации формы.
// TypeScript проверит, что его структура соответствует типу CharacterData.
export const defaultCharacter: CharacterData = {
    image: "",
    name: "",
    playerName: "",
    mentor: "",
    level: 1,
    exp: 0,
    age: "",
    gender: "",
    height: "",
    hairColor: "",
    eyeColor: "",
    skinColor: "",
    origin: "",
    secret: "",
    future: "",
    stats: {
        body: { base: 0, bonus: 0, total: 0, image: "", name: "" },
        intellect: { base: 0, bonus: 0, total: 0, image: "", name: "" },
        mysticism: { base: 0, bonus: 0, total: 0, image: "", name: "" },
        agility: { base: 0, bonus: 0, total: 0, image: "", name: "" },
        senses: { base: 0, bonus: 0, total: 0, image: "", name: "" },
        charisma: { base: 0, bonus: 0, total: 0, image: "", name: "" },
    },
    hp: { current: 10, max: 10 },
    mp: { current: 10, max: 10 },
    wp: { current: 10, max: 10 },
    combat: { magicPower: 0, evasion: 0, defense: 0 },
    inventory: [],
    notes: "<p>Заметки о персонаже...</p>",
};
