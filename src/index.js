import ReactiveGraph from 'reactive-graph';
import BasicConnector from './basic-connector';
import BasicTemplateCreator from './basic-template-creator';

export {
  BasicConnector,
  BasicTemplateCreator
};

export class ReactiveCommand {
  constructor( template, data, connector ) {
    this.template = template;
    this.data = data;
    this.connector = connector;
    this.nodes = null;
  }

  instantiate() {
    this.nodes = ReactiveGraph.instantiate( this.template,
      this.connector.insertNode.bind( this.connector, this ) );

    return this;
  }

  destroy() {
    ReactiveGraph.destroy( this.nodes );
  }
}

export function instantiate( template, data, connector ) {
  const command = new ReactiveCommand( template, data, connector );
  return command.instantiate();
}

export function destroy( command ) {
  return command.destroy();
}
