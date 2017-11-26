import createCustomError from 'custom-error-generator';

// custom-error-generator unfortunately overrides the message if strings or
// numbers are passedas arguments
export const NodeAlreadyExistsError = createCustomError( 'NODE_ALREADY_EXISTS', null,
  function construct( id ) { this.message = `Node with id '${id}' already exists`; } );

export const NodeDoesNotExistError = createCustomError( 'NODE_DOES_NOT_EXIST', null,
  function construct( id ) { this.message = `Node with id '${id}' does not exist`; } );

export const EdgeAlreadyExistsError = createCustomError( 'EDGE_ALREADY_EXISTS', null,
  function construct( from, to ) { this.message = `Edge between '${from}' and '${to}' already exists`; } );

export const UnknownNodeTypeError = createCustomError( 'UNKNOWN_NODE_TYPE', null,
  function construct( type ) { this.message = `Unknown node type: '${type}'`; } );

export const ComponentDoesNotExistError = createCustomError( 'COMPONENT_DOES_NOT_EXIST', null,
  function construct( componentName ) { this.message = `Component does not exist: '${componentName}'`; } );
