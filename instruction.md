# Руководство по созданию плагинов DocHub

## Содержание
1. [Структура плагина](#структура-плагина)
2. [Основные файлы](#основные-файлы)
3. [Регистрация плагина](#регистрация-плагина)
4. [Разработка компонентов](#разработка-компонентов)
5. [Интеграция с DocHub](#интеграция-с-dochub)
6. [Примеры](#примеры)

## Структура плагина

Плагин DocHub должен иметь следующую структуру файлов:

```
plugins/
└── your_plugin_name/
    ├── package.json         # Метаданные и зависимости плагина
    ├── index.js            # Точка входа плагина
    └── components/         # Vue компоненты
        ├── MainDocument.vue  # Основной компонент документа
        └── ...             # Дополнительные компоненты
```

## Основные файлы

### package.json
```json
{
  "name": "dochub-plugin-name",
  "version": "1.0.0",
  "description": "Описание вашего плагина",
  "main": "index.js",
  "dependencies": {
    // Укажите необходимые зависимости
  }
}
```

### index.js
```javascript
// Импорт основного компонента
import MainDocument from './components/MainDocument.vue';

// Регистрация типа документа в DocHub
window.DocHub.documents.register('your-doc-type', MainDocument);
```

### MainDocument.vue
```vue
<template>
  <div class="your-document">
    <!-- Ваш шаблон -->
  </div>
</template>

<script>
export default {
  name: 'YourDocument',
  props: {
    // Обязательные props от DocHub
    profile: {
      type: Object,
      required: true
    },
    pullData: {
      type: Function,
      required: true
    },
    getContent: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      model: null,
      error: null
    };
  },
  methods: {
    async loadData() {
      try {
        // Получение source из profile
        const source = this.profile.source || (this.profile.$base && this.profile.$base.source);
        
        if (!source) {
          throw new Error('Не указан путь к файлу модели (source) в конфигурации');
        }

        // Загрузка данных
        const data = await this.pullData();
        if (!data) {
          throw new Error('pullData вернул пустые данные');
        }

        // Обработка данных
        this.processData(data);
      } catch (err) {
        this.error = `Ошибка загрузки: ${err.message}`;
        console.error('Plugin Error:', err);
      }
    }
  },
  watch: {
    profile: {
      handler: 'loadData',
      immediate: true,
      deep: true
    }
  }
};
</script>

<style scoped>
/* Ваши стили */
</style>
```

## Регистрация плагина

1. Создайте директорию для вашего плагина в `plugins/`
2. Добавьте путь к плагину в `plugins.json`:
```json
{
  "inbuilt": [
    "plugins/html",
    "plugins/your-plugin-name"
  ]
}
```

## Разработка компонентов

### Основные принципы
1. Используйте Vue.js 2.x и его экосистему
2. Следуйте принципам компонентного подхода
3. Обрабатывайте ошибки и edge cases
4. Добавляйте отладочную информацию через console.log

### Обязательные props
- `profile`: Конфигурация документа
- `pullData`: Функция для получения данных
- `getContent`: Функция для получения содержимого

### Жизненный цикл компонента
1. Монтирование компонента
2. Загрузка данных через pullData
3. Обработка и валидация данных
4. Отображение данных или ошибки

## Интеграция с DocHub

### Конфигурация документа
```yaml
docs:
  your.plugin.example:
    location: Path/To/Document
    type: your-doc-type
    source: path/to/data.yaml
```

### Обработка данных
1. Получите данные через `pullData()`
2. Проверьте наличие необходимых полей
3. Преобразуйте данные в нужный формат
4. Обновите состояние компонента

## Примеры

### Пример плагина визуализации
```vue
<template>
  <div class="visualization">
    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="model" class="content">
      <!-- Ваша визуализация -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'VisualizationPlugin',
  // ... остальной код
};
</script>
```

### Пример обработки данных
```javascript
processData(data) {
  // Проверка структуры данных
  if (!data.yourKey) {
    throw new Error('Неверная структура данных');
  }

  // Преобразование данных
  this.model = {
    // Ваша логика обработки
  };
}
```

## Рекомендации по отладке

1. Используйте консоль браузера для отладки:
```javascript
// В разработке:
console.log('Plugin: Component mounted');
console.log('Plugin: Profile:', this.profile);
console.log('Plugin: Data:', data);

// В продакшене все console.log должны быть закомментированы:
// console.log('Plugin: Component mounted');
// console.log('Plugin: Profile:', this.profile);
// console.log('Plugin: Data:', data);
```

2. Добавьте отображение отладочной информации в компонент:
```vue
<div class="debug-info" v-if="debugInfo">
  <pre>{{ debugInfo }}</pre>
</div>
```

## Форматирование кода

### Общие правила
1. Используйте отступ в 2 пробела
2. Используйте одинарные кавычки для строк
3. Не оставляйте неиспользуемые переменные
4. Избегайте trailing commas в объектах

### Template секция
```vue
<template>
  <!-- Правильное использование v-bind и v-on -->
  <div
    v-bind:class="className"
    v-on:click="handleClick">
    <!-- Правильное выравнивание атрибутов -->
    <custom-component
      v-bind:prop1="value1"
      v-bind:prop2="value2"
      v-on:custom-event="handleEvent">
      Content
    </custom-component>
  </div>
</template>
```

### Script секция
```vue
<script>
  export default {
    // Правильный порядок опций компонента
    name: 'YourComponent',
    components: {
      // Компоненты
    },
    props: {
      // Пропсы с типами и валидацией
      propName: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        // Данные
      };
    },
    computed: {
      // Вычисляемые свойства
    },
    watch: {
      // Наблюдатели без неиспользуемых параметров
      someData() {
        // Обработка изменений
      }
    },
    created() {
      // Хуки жизненного цикла
    },
    methods: {
      // Методы
    }
  };
</script>
```

### Style секция
```vue
<style scoped>
.component-name {
  /* Базовые стили компонента */
}

.component-name__element {
  /* Стили элементов компонента */
}

.component-name--modifier {
  /* Модификаторы */
}
</style>
```

## Лучшие практики

1. **Обработка ошибок**
   - Всегда проверяйте наличие необходимых данных
   - Предоставляйте понятные сообщения об ошибках
   - Логируйте ошибки в консоль только в режиме разработки
   - Комментируйте все console.log перед продакшеном

2. **Производительность**
   - Используйте кэширование где возможно
   - Оптимизируйте рендеринг компонентов
   - Избегайте излишних вычислений
   - Используйте computed свойства вместо сложных выражений в шаблоне

3. **UI/UX**
   - Добавляйте индикаторы загрузки
   - Делайте интерфейс отзывчивым
   - Следуйте стилистике DocHub
   - Обеспечивайте доступность компонентов

4. **Код**
   - Используйте TypeScript для лучшей типизации
   - Комментируйте сложные участки кода
   - Следуйте принципам SOLID
   - Поддерживайте единый стиль кода во всем плагине
