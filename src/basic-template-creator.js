import R from 'ramda';
import graphlib from 'graphlib';
import { copyGraphInto, getNodeType, getNodeInfo } from './graph-utils';
import { NodeDoesNotExistError, UnknownNodeTypeError, ComponentDoesNotExistError } from './errors';

function getUsedSubComponents( names, templates ) {
  return R.pipe( R.map( graphName => [ graphName, templates[graphName] ] ),
                 R.fromPairs )( names );
}

export default class BasicTemplateCreator {
  constructor() {
    this.components = {};
  }

  addComponent( graphTemplate ) {
    this.components[graphTemplate.name] = graphTemplate;
  }

  addComponents( components ) {
    components.forEach( config => this.addComponent( config ) );
  }

  getComponents() {
    return this.components;
  }

  createTemplate( name ) {
    const rootComponent = this.components[name];
    return this._createTemplateInternal( rootComponent, this.components );
  }

  _createTemplateInternal( currComponent ) {
    const graph = new graphlib.Graph();

    let extComponent = currComponent;
    if ( currComponent.extends ) {
      const gTemplateToExtend = this.components[ currComponent.extends ];
      if ( gTemplateToExtend == null )
        throw new ComponentDoesNotExistError( currComponent.extends );
      extComponent = R.merge( gTemplateToExtend, currComponent );
    }

    // getting and merging subgraphs
    if ( extComponent.subgraphs ) {
      const subcomponents = getUsedSubComponents( extComponent.subgraphs, this.components );
      const subTemplates = R.map( this._createTemplateInternal.bind( this ), subcomponents );
      R.forEachObjIndexed( subTemplate => copyGraphInto( subTemplate.graph, graph ), subTemplates );
    }

    // creating nodes and edges for this graph
    R.forEachObjIndexed(
      ( nodeGroup, nodeGroupName ) => R.reduce( ( info, nodeValue ) => {
        const nodeType = getNodeType( nodeValue );
        const nodeInfo = getNodeInfo( nodeValue, nodeType );

        switch ( nodeType ) {
          case 'from-input': {
            const nodeID = `${extComponent.name}::${nodeInfo}`;
            graph.setNode( nodeID, nodeValue );
            info.prevID = nodeID;
            break;
          }
          case 'to-output': {
            const nodeID = `${extComponent.name}::${nodeInfo}`;
            graph.setNode( nodeID, nodeValue );
            if ( info.prevID )
              graph.setEdge( info.prevID, nodeID, 0 );
            info.prevID = nodeID;
            break;
          }
          case 'to-subgraph-input': {
            const nodeID = nodeInfo;
            if ( !graph.hasNode( nodeID ) )
              throw new NodeDoesNotExistError( nodeID );
            if ( info.prevID )
              graph.setEdge( info.prevID, nodeID, 0 );
            info.prevID = nodeID;
            break;
          }
          case 'from-subgraph-output': {
            const nodeID = nodeInfo;
            graph.setNode( nodeID, nodeValue );
            if ( !graph.hasNode( nodeID ) )
              throw new NodeDoesNotExistError( nodeID );
            info.prevID = nodeID;
            break;
          }
          case 'operator': {
            const nodeID = `${extComponent.name}::${nodeGroupName}-${info.index}`;
            graph.setNode( nodeID, nodeValue );
            if ( info.prevID )
              graph.setEdge( info.prevID, nodeID, 0 );
            info.prevID = nodeID;
            break;
          }
          default: throw new UnknownNodeTypeError( nodeType );
        }

        info.index++;
        return info;
      },
      { prevID: '', index: 0 },
      nodeGroup ), extComponent.graph );

    return {
      graph,
      data: extComponent.data,
      templateSource: extComponent
    };
  }
}
