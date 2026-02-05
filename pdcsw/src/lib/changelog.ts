export const APP_VERSION = "1.2.0";

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const CHANGELOG_HISTORY: ChangelogEntry[] = [
    {
        version: "1.2.0",
        date: "2026-02-05",
        changes: [
            "Добавлены заметки",
            "Форматирование текста в заметках",
            "На мобильных устройствах добавлен выбор отображения характеристик",
            "Фиксы багов"
        ]
    }
];

export const getCurrentChangelog = () => CHANGELOG_HISTORY[0];
