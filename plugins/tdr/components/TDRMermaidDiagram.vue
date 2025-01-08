<template>
  <div v-bind:class="'mermaid-container'">
    <div v-bind:class="'mermaid'" v-html="diagram" />
  </div>
</template>

<script>
  import mermaid from 'mermaid';

  export default {
    name: 'TDRMermaidDiagram',

    props: {
      theme: {
        type: String,
        default: 'default',
        validator: function(value) {
          return ['default', 'forest', 'dark', 'neutral'].indexOf(value) !== -1;
        }
      }
    },

    data() {
      return {
        mermaidConfig: {
          startOnLoad: true,
          theme: this.theme,
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        },
        diagram: `
          graph TD
          %% Основные узлы
          Motivation[Мотивация] --> Context[Контекст]
          Context --> ExpectedResult[Ожидаемый результат]
          ExpectedResult --> ArchSolution[Архитектурное решение]
          ArchSolution --> Implementation[Реализация]
          Implementation --> Reflection[Рефлексия]
          Reflection --> Knowledge[Накопление знаний]

          %% Подразделы Мотивации
          Motivation --> Drivers[Движущие силы]

          %% Подразделы Контекста
          Context --> CurrentState[Текущее состояние]
          Context --> Resources[Ресурсы]
          Context --> Landscape[Ландшафт]
          Context --> Dependencies[Зависимости]

          %% Подразделы Ожидаемого результата
          ExpectedResult --> Needs[Потребности]
          ExpectedResult --> SuccessCriteria[Критерии успеха]
          ExpectedResult --> Requirements[Требования]

          %% Подразделы Архитектурного решения
          ArchSolution --> ResourceAlloc[Распределение ресурсов]
          ArchSolution --> ImplPlan[План реализации]
          ArchSolution --> LandscapeChanges[Изменения ландшафта]

          %% Подразделы Реализации
          Implementation --> DirectPart[Прямое участие]
          Implementation --> ResControl[Контроль ресурсов]
          Implementation --> ChangeManagement[Управление изменениями]
          Implementation --> KnowledgeManagement[Управление знаниями]

          %% Стилизация
          classDef mainNode fill:#f9f,stroke:#333,stroke-width:2px
          classDef subNode fill:#bbf,stroke:#333,stroke-width:1px
          
          class Motivation,Context,ExpectedResult,ArchSolution,Implementation,Reflection,Knowledge mainNode
          class Drivers,CurrentState,Resources,Landscape,Dependencies,Needs,SuccessCriteria,Requirements,ResourceAlloc,ImplPlan,LandscapeChanges,DirectPart,ResControl,ChangeManagement,KnowledgeManagement subNode
        `
      };
    },

    mounted() {
      this.initializeMermaid();
    },

    updated() {
      this.renderDiagram();
    },

    methods: {
      initializeMermaid() {
        try {
          mermaid.initialize(this.mermaidConfig);
          this.renderDiagram();
        } catch (error) {
          console.error('Ошибка инициализации Mermaid:', error);
        }
      },

      renderDiagram() {
        this.$nextTick(() => {
          try {
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
          } catch (error) {
            console.error('Ошибка рендеринга диаграммы:', error);
          }
        });
      }
    }
  };
</script>

<style scoped>
  .mermaid-container {
    width: 100%;
    overflow-x: auto;
    padding: 20px;
  }

  .mermaid {
    width: 100%;
    min-height: 600px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Стили для темной темы */
  :deep(.mermaid[data-theme='dark']) {
    background-color: #2d2d2d;
    color: #ffffff;
  }

  /* Стили для светлой темы */
  :deep(.mermaid[data-theme='default']) {
    background-color: #ffffff;
    color: #000000;
  }
</style>

