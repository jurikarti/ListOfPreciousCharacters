export const APP_VERSION = "1.3.0";

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const CHANGELOG_HISTORY: ChangelogEntry[] = [
    {
        version: "1.3.0",
        date: "2026-02-08",
        changes: [
            "Поправлены Боевые параметры по основам правил игры.",
            "В навыках появилась кнопка 'каст', теперь можно удобно использовать навыки.",
            "Теперь можно создавать кастомные предметы.",
            "В воспоминаниях вернулась Таблица Роста."
        ]
    }
];

export const getCurrentChangelog = () => CHANGELOG_HISTORY[0];
