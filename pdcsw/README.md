# LoPC (List of Precious Characters)

Interactive character sheet for TTRPG "Precious Days", built with Next.js and Tauri.

## Interface Overview

The application features a responsive layout designed for both Desktop and Mobile use:

- **Desktop**: A comprehensive 12-column grid displaying all character sections simultaneously.
- **Mobile**: A tabbed navigation system with smooth sliding transitions and swipe gestures:
  - **General (Инфо)**: Character info (Name, Age, Gender), Player & Master details, Avatar upload, and Vital Path/Appearance info.
  - **Combat (Бой)**: Resource pools (HP, MP, WP), GL (Level) indicators, Experience bar, and Combat Parameters.
  - **Stats (Хар-ки)**: Interactive Characteristics table with automated base-stat calculations.
  - **Inventory (Вещи)**: Detailed Equipment table and a dynamic Backpack list with weight tracking.

## Key Features

- **Animated Navigation**: Swipe-to-change tabs on mobile using `framer-motion`.
- **Integrated Dice Roller**: Execute 2d6+mod checks directly from stats and equipment fields.
- **Dynamic Character Data**: Auto-save to LocalStorage and functionality to Import/Export character JSON files.
- **Secure Reset**: A secure "Reset Sheet" feature with an iOS-style slider confirmation.
- **Theming**: Full support for Light and Dark modes.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS)
- [Rust](https://www.rust-lang.org/) (required for Tauri desktop builds)

### Run Web Version

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Run Desktop Version

```bash
npm run tauri dev
```

## Build

### Web Build
```bash
npm run build
```

### Desktop Bundle
```bash
npm run tauri build
```
Generates installers in `src-tauri/target/release/bundle`.

---

# LoPC (List of Precious Characters)

Интерактивный лист персонажа для НРИ «Драгоценные дни», построенный на Next.js и Tauri.

## Обзор интерфейса

Приложение имеет адаптивный дизайн, оптимизированный для ПК и мобильных устройств:

- **ПК**: Полноценная сетка из 12 колонок, отображающая все разделы персонажа одновременно.
- **Мобильные устройства**: Система вкладок с плавной анимацией перелистывания и поддержкой жестов (свайпов):
  - **Инфо (General)**: Информация о персонаже (имя, возраст, пол), данные игрока и мастера, загрузка аватара, а также сведения о внешности и жизненном пути.
  - **Бой (Combat)**: Индикаторы ресурсов (ОЗ, ОМ, ОВ), уровень (GL), полоска опыта и боевые параметры.
  - **Хар-ки (Stats)**: Интерактивная таблица характеристик с автоматическим расчетом базовых значений.
  - **Вещи (Inventory)**: Детальная таблица экипировки и динамический список предметов в рюкзаке с отслеживанием веса.

## Ключевые особенности

- **Анимированная навигация**: Переключение вкладок с помощью свайпов на мобильных устройствах (используется `framer-motion`).
- **Встроенная система бросков**: Выполнение проверок 2d6+мод напрямую из полей характеристик и экипировки.
- **Динамические данные**: Автоматическое сохранение в LocalStorage и возможность импорта/экспорта персонажа в формате JSON.
- **Безопасный сброс**: Функция защищенной очистки листа с подтверждением через iOS-слайдер.
- **Темы**: Полная поддержка светлой и темной тем.

## Разработка

### Предварительные требования

- [Node.js](https://nodejs.org/) (последняя LTS версия)
- [Rust](https://www.rust-lang.org/) (необходим для сборки десктопной версии через Tauri)

### Запуск веб-версии

```bash
npm install
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000)

### Запуск десктопной версии

```bash
npm run tauri dev
```

## Сборка

### Веб-версия
```bash
npm run build
```

### Десктопное приложение
```bash
npm run tauri build
```
Инсталляторы будут созданы в папке `src-tauri/target/release/bundle`.
