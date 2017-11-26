import ReactiveGraph from 'reactive-graph';
import BasicConnector from './basic-connector';
import BasicTemplateCreator from './basic-template-creator';

export {
  BasicConnector,
  BasicTemplateCreator
};

export class ReactiveCommand {
  constructor( template, connector ) {
    this.template = template;
    this.connector = connector;
    this.data = template.data || {};
    this.nodes = null;
  }

  instantiate() {
    this.nodes = ReactiveGraph.instantiate( this.template.graph,
      this.connector.insertNode.bind( this.connector, this ) );

    return this;
  }

  destroy() {
    ReactiveGraph.destroy( this.nodes );
  }
}

export function instantiate( template, connector ) {
  const command = new ReactiveCommand( template, connector );
  return command.instantiate();
}

export function destroy( command ) {
  return command.destroy();
}
