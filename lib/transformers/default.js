const govukInput = require('./govukInput');
const govukRadios = require('./govukRadios');
const govukCheckboxes = require('./govukCheckboxes');
const govukTextarea = require('./govukTextarea');
const form = require('./form');

module.exports = ({schemaKey, schema, options, transformations, transform, data} = {}) => {
    const args = {schemaKey, schema, options, transformations, transform, data};

    // base default instruction on schema type
    if (schema.type === 'string') {
        if ('minLength' in schema && schema.minLength >= 500) {
            return govukTextarea(args);
        }

        if ('oneOf' in schema) {
            return govukRadios(args);
        }

        return govukInput(args);
    }

    if (schema.type === 'array') {
        return govukCheckboxes(args);
    }

    if (schema.type === 'object') {
        return form(args);
    }

    // if there is no type but there is a description, this is raw content
    if (!schema.type && schema.description) {
        return {
            id: schemaKey,
            componentName: 'content',
            content: schema.description
        };
    }

    throw Error(`No default transformer found for type "${schema.type}"`);
};
