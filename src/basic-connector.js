import R from 'ramda';
import { UnknownNodeTypeError } from './errors';
import { getNodeType } from './graph-utils';

export default class BasicConnector {
  constructor( { Observable } ) {
    this.Observable = Observable;
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
    let operatorName = nodeConfig.operator;
    const args = nodeConfig.args || [];

    // custom operators
    const operator = this.getOperator( operatorName );
    if ( operator ) {
      return operator( sources, nodeConfig, command );

    // Rx static operators
    } else if ( operatorName.startsWith( 'Observable.' ) ) {
      operatorName = operatorName.substr( 11 );

      // passing the sources (for 'merge', 'concat', etc.)
      return this.Observable[ operatorName ]( ...sources, ...args );
    }

    // Rx non-static operators
    const source = sources[0];
    const restSources = sources.splice( 1 );
    return source[ operatorName ]( ...restSources, ...args );
  }

  insertNode( command, id, nodeConfig, sources ) {
    const nodeType = getNodeType( nodeConfig );

    switch ( nodeType ) {
      case 'from-input':
      case 'to-output':
      case 'to-subgraph-input':
      case 'from-subgraph-output': {
        return ( sources.length === 1 ) ? sources[0] : this.Observable.merge( ...sources );
      }
      case 'operator': {
        return this.insertOperator( command, id, nodeConfig, sources );
      }
      default: throw new UnknownNodeTypeError( nodeType );
    }
  }
}
