import doc from './components/TDRDocument.vue';
import TDRMermaidDiagram from './components/TDRMermaidDiagram.vue';

DocHub.documents.register('tdr', doc);

export default {
  install(Vue) {
    Vue.component('TdrMermaidDiagram', TDRMermaidDiagram);
  }
};
