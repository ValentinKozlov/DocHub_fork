<template>
  <div ref="hierarchy" class="tdr-hierarchy">
    <svg v-bind:width="width" v-bind:height="height" v-on:click="handleClick">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#42b983" />
        </marker>
      </defs>

      <!-- Основная структура -->
      <g>
        <!-- Мотивация (верхний треугольник) -->
        <g class="section motivation">
          <path v-bind:d="motivationPath" class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="padding + 30"
            class="section-title"
            text-anchor="middle">
            Мотивация
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="padding + 60"
            class="section-description"
            text-anchor="middle">
            {{ sections.motivation?.description }}
          </text>
        </g>

        <!-- Контекст -->
        <g class="section context">
          <rect
            v-bind:x="padding"
            v-bind:y="height / 6"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 6"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 6 + 30"
            class="section-title"
            text-anchor="middle">
            Контекст
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 6 + 60"
            class="section-description"
            text-anchor="middle">
            {{ sections.context?.description }}
          </text>
        </g>

        <!-- Ожидаемый результат -->
        <g class="section expected-result">
          <rect
            v-bind:x="padding"
            v-bind:y="height / 3"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 6"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 3 + 30"
            class="section-title"
            text-anchor="middle">
            Ожидаемый результат
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 3 + 60"
            class="section-description"
            text-anchor="middle">
            {{ sections.expected_result?.description }}
          </text>
        </g>

        <!-- Архитектурное решение -->
        <g class="section arch-solution">
          <rect
            v-bind:x="padding"
            v-bind:y="height / 2"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 6"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 2 + 30"
            class="section-title"
            text-anchor="middle">
            Архитектурное решение
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="height / 2 + 60"
            class="section-description"
            text-anchor="middle">
            {{ sections.architectural_solution?.description }}
          </text>
        </g>

        <!-- Реализация -->
        <g class="section implementation">
          <rect
            v-bind:x="padding"
            v-bind:y="(2 * height) / 3"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 6"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="(2 * height) / 3 + 30"
            class="section-title"
            text-anchor="middle">
            Реализация
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="(2 * height) / 3 + 60"
            class="section-description"
            text-anchor="middle">
            {{ sections.implementation?.description }}
          </text>
        </g>

        <!-- Рефлексия -->
        <g class="section reflection">
          <rect
            v-bind:x="padding"
            v-bind:y="(5 * height) / 6"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 12"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="(5 * height) / 6 + 30"
            class="section-title"
            text-anchor="middle">
            Рефлексия
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="(5 * height) / 6 + 45"
            class="section-description"
            text-anchor="middle">
            {{ sections.reflection?.description }}
          </text>
        </g>

        <!-- Накопление знаний -->
        <g class="section knowledge">
          <rect
            v-bind:x="padding"
            v-bind:y="(11 * height) / 12"
            v-bind:width="width - 2 * padding"
            v-bind:height="height / 12"
            class="section-path" />
          <text
            v-bind:x="width / 2"
            v-bind:y="(11 * height) / 12 + 30"
            class="section-title"
            text-anchor="middle">
            Накопление знаний
          </text>
          <text
            v-bind:x="width / 2"
            v-bind:y="(11 * height) / 12 + 45"
            class="section-description"
            text-anchor="middle">
            {{ sections.knowledge_accumulation?.description }}
          </text>
        </g>

        <!-- Стрелки и связи -->
        <g class="connections">
          <line
            v-for="(connection, index) in connections"
            v-bind:key="index"
            v-bind:x1="connection.x1"
            v-bind:y1="connection.y1"
            v-bind:x2="connection.x2"
            v-bind:y2="connection.y2"
            class="connection-line"
            marker-end="url(#arrowhead)" />
        </g>

        <!-- Подсекции -->
        <g
          v-for="(section, key) in activeSections"
          v-bind:key="key"
          class="subsections">
          <foreignObject
            v-bind:x="section.x"
            v-bind:y="section.y"
            v-bind:width="section.width"
            v-bind:height="section.height"
            class="subsection-content">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              class="subsection-details">
              <h4>{{ section.title }}</h4>
              <p>{{ section.description }}</p>
              <ul v-if="section.items">
                <li v-for="(item, i) in section.items" v-bind:key="i">{{ item }}</li>
              </ul>
            </div>
          </foreignObject>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
  export default {
    name: 'TDRHierarchy',
    props: {
      sections: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        width: 1200,
        height: 1000,
        padding: 40,
        activeSection: null
      };
    },
    computed: {
      motivationPath() {
        const centerX = this.width / 2;
        return `M ${this.padding} ${this.height / 6} L ${centerX} ${this.padding} L ${
          this.width - this.padding
        } ${this.height / 6} Z`;
      },
      connections() {
        const centerX = this.width / 2;
        const sections = [
          this.height / 6, // Контекст
          this.height / 3, // Ожидаемый результат
          this.height / 2, // Архитектурное решение
          (2 * this.height) / 3, // Реализация
          (5 * this.height) / 6, // Рефлексия
          (11 * this.height) / 12 // Накопление знаний
        ];

        return sections
          .map((y, index) => {
            if (index === sections.length - 1) return null;
            return {
              x1: centerX,
              y1: y + this.height / 12,
              x2: centerX,
              y2: sections[index + 1]
            };
          })
          .filter(Boolean);
      },
      activeSections() {
        if (!this.activeSection) return {};

        const section = this.sections[this.activeSection];
        if (!section) return {};

        const boxWidth = this.width - 4 * this.padding;
        const boxHeight = this.height / 6;

        return Object.entries(section.subsections)
          .filter(([key]) => key !== 'description')
          .reduce((acc, [key, value]) => {
            acc[key] = {
              title: key,
              description: value.description,
              items: value.items,
              x: this.padding * 2,
              y: this.getSectionY(this.activeSection),
              width: boxWidth,
              height: boxHeight
            };
            return acc;
          }, {});
      }
    },
    watch: {
      sections: {
        handler(newSections) {
          console.log('TDRHierarchy: Sections updated:', newSections);
        },
        deep: true
      },
      activeSection(newSection) {
        console.log('TDRHierarchy: Active section changed:', newSection);
      }
    },
    created() {
      console.log('TDRHierarchy: Component created');
      console.log('TDRHierarchy: Received sections:', this.sections);
      console.log(
        'TDRHierarchy: Sections structure:',
        JSON.stringify(this.sections, null, 2)
      );
    },
    mounted() {
      console.log('TDRHierarchy: Component mounted');
      if (!this.sections) {
        console.warn('TDRHierarchy: No sections data provided');
      } else {
        console.log(
          'TDRHierarchy: Available sections:',
          Object.keys(this.sections)
        );
      }
    },
    methods: {
      handleClick(event) {
        // Определяем, на какую секцию кликнули
        const target = event.target;
        if (target.classList.contains('section-path')) {
          const section = target.closest('.section');
          if (section) {
            const sectionClass = Array.from(section.classList).find(
              (cls) => cls !== 'section'
            );

            // Преобразуем класс CSS в ключ секции
            const sectionMap = {
              motivation: 'motivation',
              context: 'context',
              'expected-result': 'expected_result',
              'arch-solution': 'architectural_solution',
              implementation: 'implementation',
              reflection: 'reflection',
              knowledge: 'knowledge_accumulation'
            };

            const sectionKey = sectionMap[sectionClass];
            this.activeSection = this.activeSection === sectionKey ? null : sectionKey;
          }
        }
      },
      getSectionY(sectionKey) {
        const sectionMap = {
          motivation: 0,
          context: this.height / 6,
          expected_result: this.height / 3,
          architectural_solution: this.height / 2,
          implementation: (2 * this.height) / 3,
          reflection: (5 * this.height) / 6,
          knowledge_accumulation: (11 * this.height) / 12
        };
        return sectionMap[sectionKey] || 0;
      }
    }
  };
</script>

<style scoped>
.tdr-hierarchy {
  position: relative;
  margin: 20px auto;
  width: fit-content;
}

.section-path {
  fill: #f8f9fa;
  stroke: #42b983;
  stroke-width: 2;
  transition: all 0.3s;
  cursor: pointer;
}

.section-path:hover {
  fill: #e9ecef;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  fill: #2c3e50;
  pointer-events: none;
}

.section-description {
  font-size: 14px;
  fill: #666;
  pointer-events: none;
}

.connection-line {
  stroke: #42b983;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

.subsection-content {
  overflow: visible;
}

.subsection-details {
  background: white;
  border: 2px solid #42b983;
  border-radius: 8px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subsection-details h4 {
  color: #42b983;
  margin: 0 0 10px 0;
}

.subsection-details p {
  color: #666;
  margin: 0 0 10px 0;
}

.subsection-details ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 5px 0;
}

.subsection-details li {
  color: #2c3e50;
  margin: 3px 0;
}
</style>
