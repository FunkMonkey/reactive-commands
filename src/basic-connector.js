import R from 'ramda';
import { UnknownNodeTypeError } from './errors';
import { getNodeType } from './graph-utils';

export default class BasicConnector {
  constructor( { Observable, merge } ) {
    this.Observable = Observable;
    this.merge = merge;
    this.operators = {};
  }

  addOperator( name, operator ) {
    this.operators[ name ] = operator;
  }

  addOperators( operators ) {
    R.forEachObjIndexed( ( operator, name ) => { this.addOperator( name, operator ); }, operators );
  }

  getOperator( name ) {
    return this.operators[ name ];
  }

  // Simple inserter that will be called for every operator.
  // Expects an array with the operator's name as the first element.
  insertOperator( command, id, nodeConfig, sources ) {
    const operatorName = nodeConfig.operator;

    // custom operators
    const operator = this.getOperator( operatorName );
    if ( operator ) {
      return operator( sources, nodeConfig, command );
    }

    // handle subscriptions
    if ( operatorName === 'subscribe' ) {
      return sources[0].subscribe( ...sources.splice( 1 ) );
    }

    throw new Error( `Operator "${operatorName}" not found!` );
  }

  insertNode( command, id, nodeConfig, sources ) {
    const nodeType = getNodeType( nodeConfig );

    switch ( nodeType ) {
      case 'from-input':
      case 'to-output':
      case 'to-subgraph-input':
      case 'from-subgraph-output': {
        return ( sources.length === 1 ) ? sources[0] : this.merge( ...sources );
      }
      case 'operator': {
        return this.insertOperator( command, id, nodeConfig, sources );
      }
      default: throw new UnknownNodeTypeError( nodeType );
    }
  }
}
