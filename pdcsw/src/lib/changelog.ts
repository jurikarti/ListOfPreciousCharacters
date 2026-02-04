export const APP_VERSION = "1.0.0";

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const CHANGELOG_HISTORY: ChangelogEntry[] = [
    {
        version: "1.1.0",
        date: "2026-02-04",
        changes: [
            "Добавленны готовые персонажи для быстрого старта.",
            "Исправлен свайп для удаления листа персонажа",
            "Добавлены ссылки на соцсети в by jurikarti",
            "Добавлены анимации броска кубиков",
            "Чуть чуть подправил интерфейс",
            "Ссылка на тгк канал проекта в кнопке by jurikarti",
        ]
    }
];

export const getCurrentChangelog = () => CHANGELOG_HISTORY[0];
