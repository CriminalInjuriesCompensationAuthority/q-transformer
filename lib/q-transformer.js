// TODO: this shouldn't be here
const defaultTransformer = require('./transformers/default');

function createQTransformer(transformers = {default: defaultTransformer}) {
    function transform({
        schemaKey = '',
        schema = '',
        uiSchema = {},
        transformations = {},
        data = {}
    } = {}) {
        let transformerName = 'default';
        const transformerOptions = {
            schemaKey,
            schema,
            options: {},
            transformations,
            transform,
            data
        };

        if (schemaKey in uiSchema) {
            const instruction = uiSchema[schemaKey];

            if ('transformer' in instruction) {
                transformerName = instruction.transformer;
            }

            if ('options' in instruction) {
                transformerOptions.options = instruction.options;
            }
        }

        const transformer = transformers[transformerName];

        if (!transformer) {
            throw Error(`No transformer found with name: "${transformerName}"`);
        }

        return transformers[transformerName](transformerOptions);
    }

    return Object.freeze({
        transform
    });
}

module.exports = createQTransformer;
