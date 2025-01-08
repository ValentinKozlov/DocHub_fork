<template>
  <div ref="wheel" class="process-wheel">
    <svg v-bind:width="size" v-bind:height="size" v-on:click="handleClick">
      <!-- Центральный круг -->
      <circle
        v-bind:cx="center"
        v-bind:cy="center"
        v-bind:r="innerRadius"
        class="center-circle" />
      
      <!-- Центральный текст -->
      <text
        v-bind:x="center"
        v-bind:y="center"
        class="center-text"
        text-anchor="middle"
        alignment-baseline="middle">
        {{ title }}
      </text>

      <!-- Секции -->
      <g v-for="section in processedSections" v-bind:key="section.key">
        <!-- Сектор -->
        <path
          v-bind:d="section.path"
          v-bind:class="['section', { active: section.key === activeSection }]"
          v-on:click="selectSection(section.key)" />
        
        <!-- Текст секции -->
        <text
          v-bind:x="section.textX"
          v-bind:y="section.textY"
          v-bind:transform="section.textTransform"
          class="section-text"
          text-anchor="middle">
          {{ section.title }}
        </text>
      </g>

      <!-- Линии связи -->
      <path
        v-for="(line, index) in connectionLines"
        v-bind:key="'line-' + index"
        v-bind:d="line"
        class="connection-line" />
    </svg>

    <!-- Детали активной секции -->
    <div v-if="activeSection" class="section-details" v-bind:style="detailsStyle">
      <h3>{{ sections[activeSection].title }}</h3>
      <p class="description">{{ sections[activeSection].description }}</p>
      
      <div
        v-for="subsection in activeSubsections" 
        v-bind:key="subsection.key"
        class="subsection">
        <h4>{{ subsection.key }}</h4>
        <p v-if="subsection.description">{{ subsection.description }}</p>
        <ul v-if="subsection.items">
          <li v-for="(item, i) in subsection.items" v-bind:key="i">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ProcessWheel',
    props: {
      sections: {
        type: Object,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        size: 800,
        innerRadius: 80,
        outerRadius: 300,
        activeSection: null,
        detailsPosition: { x: 0, y: 0 }
      };
    },
    computed: {
      center() {
        return this.size / 2;
      },
      processedSections() {
        const sectionKeys = Object.keys(this.sections);
        const angleStep = (2 * Math.PI) / sectionKeys.length;
      
        return sectionKeys.map((key, index) => {
          const startAngle = index * angleStep;
          const endAngle = (index + 1) * angleStep;
        
          // Вычисляем путь для сектора
          const path = this.calculateSectorPath(startAngle, endAngle);
        
          // Вычисляем позицию для текста
          const textRadius = (this.innerRadius + this.outerRadius) / 2;
          const textAngle = startAngle + angleStep / 2;
          const textX = this.center + textRadius * Math.cos(textAngle);
          const textY = this.center + textRadius * Math.sin(textAngle);
        
          return {
            key,
            title: this.sections[key].title,
            path,
            textX,
            textY,
            textTransform: `rotate(${(textAngle * 180 / Math.PI)})`
          };
        });
      },
      connectionLines() {
        // Генерируем линии связи между секциями
        return this.processedSections.map((section, index) => {
          const nextIndex = (index + 1) % this.processedSections.length;
          const current = this.processedSections[index];
          const next = this.processedSections[nextIndex];
        
          return `M ${current.textX} ${current.textY} Q ${this.center} ${this.center} ${next.textX} ${next.textY}`;
        });
      },
      detailsStyle() {
        return {
          position: 'absolute',
          left: `${this.detailsPosition.x}px`,
          top: `${this.detailsPosition.y}px`
        };
      },
      activeSubsections() {
        if (!this.activeSection || !this.sections[this.activeSection]) return [];
        return Object.entries(this.sections[this.activeSection].subsections)
          .filter(([key]) => key !== 'description')
          .map(([key, value]) => ({
            key,
            description: value.description,
            items: value.items
          }));
      }
    },
    methods: {
      calculateSectorPath(startAngle, endAngle) {
        const x1 = this.center + this.innerRadius * Math.cos(startAngle);
        const y1 = this.center + this.innerRadius * Math.sin(startAngle);
        const x2 = this.center + this.outerRadius * Math.cos(startAngle);
        const y2 = this.center + this.outerRadius * Math.sin(startAngle);
        const x3 = this.center + this.outerRadius * Math.cos(endAngle);
        const y3 = this.center + this.outerRadius * Math.sin(endAngle);
        const x4 = this.center + this.innerRadius * Math.cos(endAngle);
        const y4 = this.center + this.innerRadius * Math.sin(endAngle);

        return `M ${x1} ${y1} L ${x2} ${y2} A ${this.outerRadius} ${this.outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${this.innerRadius} ${this.innerRadius} 0 0 0 ${x1} ${y1}`;
      },
      selectSection(key) {
        this.activeSection = this.activeSection === key ? null : key;
      
        // Вычисляем позицию для деталей
        if (this.activeSection) {
          const section = this.processedSections.find(s => s.key === key);
          const rect = this.$refs.wheel.getBoundingClientRect();
          this.detailsPosition = {
            x: section.textX - rect.left,
            y: section.textY - rect.top
          };
        }
      },
      handleClick(event) {
        // Закрываем детали при клике вне секций
        if (event.target.tagName === 'svg') {
          this.activeSection = null;
        }
      }
    }
  };
</script>

<style scoped>
.process-wheel {
  position: relative;
  margin: 20px auto;
  width: fit-content;
}

.center-circle {
  fill: #42b983;
  transition: fill 0.3s;
}

.center-text {
  fill: white;
  font-size: 14px;
  font-weight: bold;
}

.section {
  fill: #f8f9fa;
  stroke: #42b983;
  stroke-width: 2;
  transition: all 0.3s;
  cursor: pointer;
}

.section:hover {
  fill: #e9ecef;
}

.section.active {
  fill: #42b983;
}

.section-text {
  fill: #2c3e50;
  font-size: 12px;
  pointer-events: none;
}

.connection-line {
  fill: none;
  stroke: #42b983;
  stroke-width: 1;
  stroke-dasharray: 5,5;
  opacity: 0.5;
}

.section-details {
  background: white;
  border: 2px solid #42b983;
  border-radius: 8px;
  padding: 15px;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.section-details h3 {
  color: #42b983;
  margin-top: 0;
  margin-bottom: 10px;
}

.section-details .description {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.subsection {
  margin-bottom: 15px;
}

.subsection h4 {
  color: #2c3e50;
  margin: 10px 0 5px;
}

.subsection ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 5px 0;
}

.subsection li {
  color: #2c3e50;
  margin: 3px 0;
}
</style> 
