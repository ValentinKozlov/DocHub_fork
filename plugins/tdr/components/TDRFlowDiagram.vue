<template>
  <div v-bind:class="'flow-container'" ref="container">
    <div v-bind:class="'controls'">
      <button v-on:click="centerGraph">Центрировать</button>
      <button v-on:click="resetZoom">Сбросить масштаб</button>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'TDRFlowDiagram',

  props: {
    sections: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      width: 0,
      height: 0,
      simulation: null,
      svg: null,
      g: null,
      zoom: null,
      nodes: [],
      links: [],
      nodeColors: {
        motivation: { main: '#FF6B6B', sub: '#FFB4B4' },         // Красный
        context: { main: '#4ECDC4', sub: '#A7E8E3' },           // Бирюзовый
        expected_result: { main: '#45B7D1', sub: '#9CD7E5' },    // Голубой
        architectural_solution: { main: '#96CEB4', sub: '#CCE5D9' }, // Зеленый
        implementation: { main: '#FFEEAD', sub: '#FFF6D6' },     // Желтый
        reflection: { main: '#D4A5A5', sub: '#E9D2D2' },         // Розовый
        knowledge_accumulation: { main: '#9B59B6', sub: '#CDADDB' } // Фиолетовый
      },
      mainNodes: [
        { id: 'motivation', label: 'Мотивация', group: 'main', description: '' },
        { id: 'context', label: 'Контекст', group: 'main', description: '' },
        { id: 'expected_result', label: 'Ожидаемый результат', group: 'main', description: '' },
        { id: 'architectural_solution', label: 'Архитектурное решение', group: 'main', description: '' },
        { id: 'implementation', label: 'Реализация', group: 'main', description: '' },
        { id: 'reflection', label: 'Рефлексия', group: 'main', description: '' },
        { id: 'knowledge_accumulation', label: 'Накопление знаний', group: 'main', description: '' }
      ],
      mainLinks: [
        { source: 'motivation', target: 'context', type: 'main' },
        { source: 'context', target: 'expected_result', type: 'main' },
        { source: 'expected_result', target: 'architectural_solution', type: 'main' },
        { source: 'architectural_solution', target: 'implementation', type: 'main' },
        { source: 'implementation', target: 'reflection', type: 'main' },
        { source: 'reflection', target: 'knowledge_accumulation', type: 'main' }
      ]
    };
  },

  mounted() {
    this.initGraph();
    this.updateGraph();
    window.addEventListener('resize', this.onResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.simulation) {
      this.simulation.stop();
    }
  },

  methods: {
    initGraph() {
      const container = this.$refs.container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;

      // Создаем SVG
      this.svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, this.width, this.height]);

      // Добавляем поддержку зума
      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          this.g.attr('transform', event.transform);
        });

      this.svg.call(this.zoom);

      // Создаем основную группу для элементов
      this.g = this.svg.append('g');

      // Добавляем маркер для стрелок
      this.svg.append('defs').selectAll('marker')
        .data(['main', 'sub'])
        .join('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 30)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', d => d === 'main' ? '#42b983' : '#bbbbff')
        .attr('d', 'M0,-5L10,0L0,5');

      // Инициализируем симуляцию с увеличенным расстоянием между узлами
      this.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(300))
        .force('charge', d3.forceManyBody().strength(-2000))
        .force('collide', d3.forceCollide().radius(150))
        .force('x', d3.forceX(this.width / 2))
        .force('y', d3.forceY(this.height / 2))
        .on('tick', this.tick);
    },

    updateGraph() {
      if (!this.sections) return;

      // Подготавливаем данные
      const nodes = [...this.mainNodes];
      const links = [...this.mainLinks];

      // Добавляем подразделы
      Object.entries(this.sections).forEach(([key, section]) => {
        const subsections = section.subsections;
        if (!subsections) return;

        Object.entries(subsections).forEach(([subKey, subsection]) => {
          if (subKey === 'description') return;

          const nodeId = `${key}_${subKey}`;
          const description = typeof subsection === 'object' && subsection.description 
            ? subsection.description 
            : (typeof subsection === 'string' ? subsection : '');

          nodes.push({
            id: nodeId,
            label: subKey,
            description: description,
            group: 'sub',
            parentId: key
          });

          links.push({
            source: key,
            target: nodeId,
            type: 'sub'
          });
        });
      });

      this.nodes = nodes;
      this.links = links;

      // Обновляем связи
      const link = this.g.selectAll('.link')
        .data(links)
        .join('path')
        .attr('class', 'link')
        .attr('data-type', d => d.type)
        .style('stroke', d => {
          const colors = this.nodeColors[d.source.id];
          return colors ? colors.main : '#000000';
        })
        .attr('marker-end', d => `url(#arrow-${d.type})`);

      // Обновляем узлы
      const node = this.g.selectAll('.node')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .attr('data-group', d => d.group)
        .attr('data-parent', d => d.parentId || d.id)
        .call(d3.drag()
          .on('start', this.dragstart)
          .on('drag', this.dragged)
          .on('end', this.dragended));

      // Добавляем прямоугольники для узлов
      node.selectAll('rect')
        .data(d => [d])
        .join('rect')
        .attr('width', d => {
          const labelWidth = d.label.length * 12;
          const descWidth = d.description ? d.description.length * 8 : 0;
          return Math.max(200, labelWidth + 40, descWidth + 40);
        })
        .attr('height', d => {
          if (d.group === 'main') return 60;
          return d.description ? 80 : 40;
        })
        .attr('rx', 5)
        .attr('ry', 5)
        .style('fill', d => {
          const colors = this.nodeColors[d.parentId || d.id];
          return colors ? (d.group === 'main' ? colors.main : colors.sub) : '#ffffff';
        })
        .style('stroke', d => {
          const colors = this.nodeColors[d.parentId || d.id];
          return colors ? colors.main : '#000000';
        });

      // Добавляем текст
      const text = node.selectAll('text')
        .data(d => [d])
        .join('text')
        .attr('text-anchor', 'middle');

      // Добавляем заголовок
      text.selectAll('tspan.title')
        .data(d => [d])
        .join('tspan')
        .attr('class', 'title')
        .text(d => d.label)
        .attr('x', d => {
          const width = Math.max(200, d.label.length * 12 + 40);
          return width / 2;
        })
        .attr('y', d => d.group === 'main' ? 35 : (d.description ? 30 : 25));

      // Добавляем описание
      text.selectAll('tspan.description')
        .data(d => d.description ? [d] : [])
        .join('tspan')
        .attr('class', 'description')
        .text(d => d.description)
        .attr('x', d => {
          const width = Math.max(200, d.description.length * 8 + 40);
          return width / 2;
        })
        .attr('y', 60)
        .attr('font-size', '12px')
        .attr('fill', '#666');

      // Обновляем симуляцию
      this.simulation.nodes(nodes);
      this.simulation.force('link').links(links);
      this.simulation.alpha(1).restart();
    },

    tick() {
      // Обновляем позиции связей с учетом новых размеров
      this.g.selectAll('.link')
        .attr('d', d => {
          const sourceWidth = Math.max(200, d.source.label.length * 12 + 40);
          const targetWidth = Math.max(200, d.target.label.length * 12 + 40);
          const sourceHeight = d.source.group === 'main' ? 60 : (d.source.description ? 80 : 40);
          const targetHeight = d.target.group === 'main' ? 60 : (d.target.description ? 80 : 40);

          const sourceX = d.source.x + sourceWidth / 2;
          const sourceY = d.source.y + sourceHeight / 2;
          const targetX = d.target.x + targetWidth / 2;
          const targetY = d.target.y + targetHeight / 2;
          
          return `M${sourceX},${sourceY}Q${(sourceX + targetX) / 2},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
        });

      // Обновляем позиции узлов
      this.g.selectAll('.node')
        .attr('transform', d => `translate(${d.x},${d.y})`);
    },

    dragstart(event, d) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },

    dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    },

    dragended(event, d) {
      if (!event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },

    centerGraph() {
      const transform = d3.zoomIdentity
        .translate(this.width / 2, this.height / 2)
        .scale(1);
      
      this.svg.transition()
        .duration(750)
        .call(this.zoom.transform, transform);
    },

    resetZoom() {
      this.svg.transition()
        .duration(750)
        .call(this.zoom.transform, d3.zoomIdentity);
    },

    onResize() {
      const container = this.$refs.container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;
      this.svg.attr('viewBox', [0, 0, this.width, this.height]);
      this.simulation.force('x', d3.forceX(this.width / 2));
      this.simulation.force('y', d3.forceY(this.height / 2));
      this.simulation.alpha(1).restart();
    }
  },

  watch: {
    sections: {
      handler: 'updateGraph',
      deep: true
    }
  }
};
</script>

<style scoped>
.flow-container {
  width: 100%;
  height: 800px;
  position: relative;
  background-color: #f8f9fa;
}

.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
}

.controls button {
  margin-left: 10px;
  padding: 5px 10px;
  background: white;
  border: 1px solid #42b983;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #42b983;
  color: white;
}

:deep(.node) {
  cursor: move;
}

:deep(.node rect) {
  stroke-width: 2px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
}

:deep(.node[data-group='main'] rect) {
  fill: #e6f3ff;
  stroke: #3498db;
  stroke-width: 3px;
}

:deep(.node[data-group='sub'] rect) {
  fill: #fff5e6;
  stroke: #f39c12;
}

:deep(.node text) {
  font-family: Arial, sans-serif;
  pointer-events: none;
  white-space: pre-wrap;
  fill: #2c3e50;  /* Темный цвет для всего текста */
}

:deep(.node[data-group='main'] text .title) {
  font-weight: bold;
  font-size: 16px;
}

:deep(.node[data-group='sub'] text .title) {
  font-weight: bold;
  font-size: 14px;
}

:deep(.node text .description) {
  font-size: 12px;
  fill: #666;
}

:deep(.link) {
  fill: none;
  stroke-width: 2px;
}

:deep(.link[data-type='main']) {
  stroke-width: 3px;
}

:deep(.link[data-type='sub']) {
  stroke-dasharray: 5,5;
  opacity: 0.7;
}

:deep(#arrow-main path) {
  fill: #3498db;
}

:deep(#arrow-sub path) {
  fill: #f39c12;
}
</style> 