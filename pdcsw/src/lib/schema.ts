import { z } from "zod";

// Характеристика (например, Телосложение)
// Мы добавляем .default({}), чтобы если поле отсутствует, оно создавалось само
const statSchema = z.object({
    base: z.coerce.number().default(0),
    bonus: z.coerce.number().default(0),
    total: z.coerce.number().default(0),
}).default({});

export const characterSchema = z.object({
    // Шапка
    name: z.string().default(""),
    playerName: z.string().default(""),
    mentor: z.string().default(""),
    level: z.coerce.number().default(1),
    exp: z.coerce.number().default(0),

    // Внешность
    age: z.string().default(""),
    gender: z.string().default(""),
    height: z.string().default(""),
    hairColor: z.string().default(""),
    eyeColor: z.string().default(""),
    skinColor: z.string().default(""),

    // Жизненный путь
    origin: z.string().default(""),
    secret: z.string().default(""),
    future: z.string().default(""),

    // Характеристики
    // Каждое поле здесь использует statSchema с дефолтными значениями
    stats: z.object({
        body: statSchema,      // Телосложение
        intellect: statSchema, // Интеллект
        mysticism: statSchema, // Мистицизм
        agility: statSchema,   // Ловкость
        senses: statSchema,    // Чувства
        charisma: statSchema,  // Харизма
    }).default({}), // <--- Важно: дефолт для всего объекта stats

    // Вторичные
    // Добавляем .default() для внутренних полей и для самого объекта
    hp: z.object({
        current: z.coerce.number().default(10),
        max: z.coerce.number().default(10)
    }).default({}),

    mp: z.object({
        current: z.coerce.number().default(10),
        max: z.coerce.number().default(10)
    }).default({}),

    wp: z.object({
        current: z.coerce.number().default(10),
        max: z.coerce.number().default(10)
    }).default({}),

    // Боевые параметры
    combat: z.object({
        magicPower: z.coerce.number().default(0),
        evasion: z.coerce.number().default(0),
        defense: z.coerce.number().default(0),
    }).default({}), // <--- Важно: дефолт для всего объекта combat

    // Инвентарь
    inventory: z.array(z.object({
        slot: z.string(),
        name: z.string(),
        weight: z.coerce.number(),
        effect: z.string(),
    })).default([]),

    // Заметки (HTML)
    notes: z.string().default("<p>Заметки о персонаже...</p>"),
});

export type CharacterData = z.infer<typeof characterSchema>;

// Теперь parse({}) сработает корректно, так как все поля имеют дефолтные значения
export const defaultCharacter: CharacterData = characterSchema.parse({});