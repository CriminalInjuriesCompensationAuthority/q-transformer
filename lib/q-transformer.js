// TODO: this shouldn't be here - default should be supplied at creation time
const defaultTransformer = require('./transformers/default');
const govukSelectTransformer = require('./transformers/govukSelect');

function createQTransformer(
    transformers = {
        default: defaultTransformer,
        govukSelect: govukSelectTransformer
    }
) {
    function transform({
        schemaKey,
        schema,
        uiSchema = {},
        transformations = {},
        data = {},
        schemaErrors = {}
    } = {}) {
        if (!schemaKey) {
            throw Error(`"schemaKey" is required`);
        }

        if (!schema) {
            throw Error(`No schema found for schema key: ${schemaKey}`);
        }

        let transformerName = 'default';
        const transformerOptions = {
            schemaKey,
            schema,
            options: {},
            transformations,
            transform,
            data,
            schemaErrors
        };

        if (schemaKey in uiSchema) {
            const instruction = uiSchema[schemaKey];

            if ('transformer' in instruction) {
                transformerName = instruction.transformer;
            }

            if ('options' in instruction) {
                if (instruction.options.isSummary) {
                    transformerOptions.options = uiSchema;
                } else {
                    transformerOptions.options = instruction.options;
                }
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
