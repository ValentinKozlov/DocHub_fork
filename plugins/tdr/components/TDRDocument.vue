<template>
  <div class="tdr-document">
    <div v-if="error" class="error">
      {{ error }}
      <div v-if="debugInfo" class="debug-info">
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
    <div v-else-if="model" class="tdr-model">
      <div class="view-switcher">
        <button 
          v-bind:class="['view-button', { active: currentView === 'list' }]" 
          v-on:click="currentView = 'list'">
          Список
        </button>
        <button 
          v-bind:class="['view-button', { active: currentView === 'wheel' }]" 
          v-on:click="currentView = 'wheel'">
          Круговая диаграмма
        </button>
        <button 
          v-bind:class="['view-button', { active: currentView === 'hierarchy' }]" 
          v-on:click="currentView = 'hierarchy'">
          Иерархия
        </button>
        <button 
          v-bind:class="['view-button', { active: currentView === 'mermaid' }]" 
          v-on:click="currentView = 'mermaid'">
          Mermaid диаграмма
        </button>
        <button 
          v-bind:class="['view-button', { active: currentView === 'flow' }]" 
          v-on:click="currentView = 'flow'">
          Flow диаграмма
        </button>
      </div>

      <!-- Список -->
      <div v-if="currentView === 'list'" class="list-view">
        <h1>{{ model.description }}</h1>
        
        <div v-for="(section, sectionKey) in sections" v-bind:key="sectionKey" class="tdr-section">
          <h2>{{ section.title }}</h2>
          <p class="description">{{ section.description }}</p>
          
          <template v-for="(subsection, subsectionKey) in section.subsections">
            <div v-if="subsectionKey !== 'description'" v-bind:key="subsectionKey" class="tdr-subsection">
              <h3>{{ subsectionKey }}</h3>
              <p v-if="typeof subsection === 'object' && subsection.description">{{ subsection.description }}</p>
              
              <div v-if="subsection.items" class="items-list">
                <ul>
                  <li v-for="(item, index) in subsection.items" v-bind:key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Круговая диаграмма -->
      <div v-else-if="currentView === 'wheel'" class="wheel-view">
        <process-wheel 
          v-bind:sections="sections"
          v-bind:title="model.description" />
      </div>

      <!-- Иерархическая диаграмма -->
      <div v-else-if="currentView === 'hierarchy'" class="hierarchy-view">
        <tdr-hierarchy
          v-bind:sections="sections" />
      </div>

      <!-- Добавляем новый view -->
      <div v-else-if="currentView === 'mermaid'" class="mermaid-view">
        <tdr-mermaid-diagram />
      </div>

      <!-- Добавляем Flow диаграмму -->
      <div v-else-if="currentView === 'flow'" class="flow-view">
        <tdr-flow-diagram v-bind:sections="sections" />
      </div>
    </div>
  </div>
</template>

<script>
  import ProcessWheel from './ProcessWheel.vue';
  import TDRHierarchy from './TDRHierarchy.vue';
  import TDRMermaidDiagram from './TDRMermaidDiagram.vue';
  import TDRFlowDiagram from './TDRFlowDiagram.vue';

  export default {
    name: 'TDRDocument',
    components: {
      ProcessWheel,
      'tdr-hierarchy': TDRHierarchy,
      'tdr-mermaid-diagram': TDRMermaidDiagram,
      'tdr-flow-diagram': TDRFlowDiagram
    },
    props: {
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
        error: null,
        sections: null,
        debugInfo: null,
        currentView: 'wheel' // По умолчанию показываем диаграмму
      };
    },
    watch: {
      profile: {
        handler: 'loadData',
        immediate: true,
        deep: true
      }
    },
    methods: {
      async loadData() {
        try {
          // Отладочная информация
          // console.log('TDR Plugin: Component mounted');
          // console.log('TDR Plugin: Profile keys:', Object.keys(this.profile));
          // console.log('TDR Plugin: Profile values:', Object.values(this.profile));
        
          // Проверяем наличие source в profile
          const source = this.profile.source || (this.profile.$base && this.profile.$base.source);
        
          if (!source) {
            this.debugInfo = JSON.stringify({
              profile: this.profile,
              profileKeys: Object.keys(this.profile),
              profileBase: this.profile.$base
            }, null, 2);
            throw new Error('Не указан путь к файлу модели (source) в конфигурации');
          }

          // console.log('TDR Plugin: Using source:', source);

          // Получаем данные через pullData
          const data = await this.pullData();
          // console.log('TDR Plugin: Pulled data:', data);

          if (!data) {
            throw new Error('pullData вернул пустые данные');
          }

          if (!data['ceaf.tdr.model']) {
            // console.error('TDR Plugin: Missing ceaf.tdr.model in data:', data);
            throw new Error('В данных отсутствует секция ceaf.tdr.model');
          }

          this.model = data['ceaf.tdr.model'];
          this.processModel();
        } catch (err) {
          const errorMessage = `Ошибка загрузки модели TDR: ${err.message}`;
          this.error = errorMessage;
          // console.error('TDR Plugin Error:', {
          //   message: err.message,
          //   profile: this.profile,
          //   error: err,
          //   stack: err.stack
          // });
        }
      },
      processModel() {
        if (!this.model) return;
      
        // console.log('TDR Plugin: Processing model:', this.model);
      
        const sectionMap = {
          motivation: 'Мотивация',
          context: 'Контекст',
          expected_result: 'Ожидаемый результат',
          architectural_solution: 'Архитектурное решение',
          implementation: 'Реализация',
          reflection: 'Рефлексия',
          knowledge_accumulation: 'Накопление знаний'
        };

        this.sections = {};
      
        Object.entries(sectionMap).forEach(([key, title]) => {
          if (this.model[key]) {
            const section = this.model[key];
            const subsections = { ...section };
            delete subsections.description;

            this.sections[key] = {
              title,
              description: section.description || '',
              subsections
            };
          }
        });
      
        // console.log('TDR Plugin: Processed sections:', this.sections);
        // console.log('TDR Plugin: Current view:', this.currentView);
        // console.log('TDR Plugin: Sections structure:', JSON.stringify(this.sections, null, 2));
      }
    }
  };
</script>

<style scoped>
.tdr-document {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.view-switcher {
  margin-bottom: 20px;
  text-align: center;
}

.view-button {
  padding: 8px 16px;
  margin: 0 8px;
  border: 2px solid #42b983;
  background: white;
  color: #42b983;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-button.active {
  background: #42b983;
  color: white;
}

.view-button:hover {
  background: #42b983;
  color: white;
}

.error {
  color: red;
  padding: 20px;
  border: 1px solid red;
  border-radius: 4px;
  margin: 20px 0;
}

.debug-info {
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-info pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.list-view .tdr-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.list-view .tdr-section h2 {
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.list-view .description {
  color: #666;
  font-style: italic;
  margin-bottom: 20px;
}

.list-view .tdr-subsection {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.list-view .tdr-subsection h3 {
  color: #42b983;
  margin-bottom: 10px;
}

.list-view .items-list ul {
  list-style-type: disc;
  padding-left: 20px;
}

.list-view .items-list li {
  margin: 5px 0;
  color: #2c3e50;
}

.wheel-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 800px;
}

.hierarchy-view {
  margin: 20px auto;
  max-width: 1000px;
}

.mermaid-view {
  margin: 20px auto;
  max-width: 1000px;
}

.flow-view {
  margin: 20px auto;
  max-width: 1200px;
  height: 800px;
}
</style> 
