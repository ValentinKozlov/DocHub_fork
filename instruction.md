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

## Форматирование кода

### Порядок действий при форматировании Vue компонентов

1. Перед внесением изменений в код проверить правила форматирования в `.eslintrc.js`
2. Обратить особое внимание на следующие правила:
   - `vue/script-indent`: базовый отступ и отступы для вложенных элементов
   - `vue/html-indent`: правила отступов для template
   - `vue/v-bind-style`: использование полной формы v-bind
   - `vue/v-on-style`: использование полной формы v-on
   - Правила форматирования атрибутов и их выравнивания

3. Учитывать специальные правила отступов:
   - Базовый отступ (baseIndent) для разных секций компонента
   - Отступы для атрибутов (attribute)
   - Правила закрытия скобок (closeBracket)
   - Вертикальное выравнивание атрибутов (alignAttributesVertically)

4. Проверить дополнительные правила Vue:
   - Именование компонентов (component-name-in-template-casing)
   - Максимальное количество атрибутов на строку (max-attributes-per-line)
   - Правила переноса строк (html-closing-bracket-newline)

### Пример правильного форматирования

```vue
<template>
  <div v-bind:class="'container'">
    <component-name
      v-bind:prop1="value1"
      v-bind:prop2="value2"
      v-on:event="handler">
      Content
    </component-name>
  </div>
</template>

<script>
  import Component from './Component.vue';

  export default {
    name: 'ComponentName',
    
    components: {
      Component
    },
    
    data() {
      return {
        value: ''
      };
    }
  };
</script>
```

### Проверка форматирования

1. Запустить проверку ESLint:
   ```bash
   npm run lint
   ```

2. Исправить ошибки форматирования:
   ```bash
   npm run lint -- --fix
   ```

3. Проверить, что все ошибки исправлены и код соответствует стандартам проекта

## Именование компонентов

### Правила именования
1. **В шаблонах (template)**: 
   - Использовать kebab-case
   - Пример: `<tdr-mermaid-diagram />`
   - Правило ESLint: `vue/component-name-in-template-casing`

2. **При регистрации компонентов**:
   - Использовать PascalCase для имени компонента
   - Использовать PascalCase для импортируемого компонента
   ```javascript
   import TDRMermaidDiagram from './components/TDRMermaidDiagram.vue';
   
   export default {
     install(Vue) {
       Vue.component('TdrMermaidDiagram', TDRMermaidDiagram);
     }
   };
   ```

3. **Имена файлов компонентов**:
   - Использовать PascalCase
   - Пример: `TDRMermaidDiagram.vue`

### Пример правильного использования
```vue
<!-- В template (kebab-case) -->
<template>
  <div class="container">
    <tdr-mermaid-diagram />
    <custom-component />
  </div>
</template>

<!-- В script (PascalCase) -->
<script>
import TDRMermaidDiagram from './TDRMermaidDiagram.vue';
import CustomComponent from './CustomComponent.vue';

export default {
  name: 'ParentComponent',
  components: {
    TdrMermaidDiagram,
    CustomComponent
  }
};
</script>
```

### Проверка именования
1. ESLint проверит правильность именования с помощью правил:
   - `vue/component-name-in-template-casing` (требует kebab-case в шаблонах)
   - `vue/component-definition-name-casing` (требует PascalCase при регистрации)

2. Типичные ошибки и их исправление:
   ```javascript
   // Неправильно
   Vue.component('tdr-mermaid-diagram', TDRMermaidDiagram);  // kebab-case не допускается при регистрации
   <TdrMermaidDiagram />  // PascalCase не допускается в шаблоне
   components: {
     'tdr-mermaid': TDRMermaidDiagram  // Имя компонента не соответствует использованию в шаблоне
   }

   // Правильно
   Vue.component('TdrMermaidDiagram', TDRMermaidDiagram);  // PascalCase при регистрации
   <tdr-mermaid-diagram />  // kebab-case в шаблоне
   components: {
     'tdr-mermaid-diagram': TDRMermaidDiagram  // Имя соответствует использованию в шаблоне
   }
   ```

### Важные замечания
1. Имя компонента при регистрации должно точно соответствовать тому, как он используется в шаблоне
2. ESLint предупредит о компонентах, которые зарегистрированы, но не используются
3. При изменении имени компонента нужно обновить его везде:
   - В импорте (PascalCase)
   - В регистрации компонента (kebab-case в локальной регистрации)
   - В шаблоне (kebab-case)
