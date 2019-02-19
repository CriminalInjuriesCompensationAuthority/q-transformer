const merge = require('lodash.merge');

function createQTransformer() {
    /**
     * Transform a JSON Schema in to a different format
     *
     * @param {Object} opts -
     * @param {*} schema
     * @param {*} uiSchema
     */
    function transform({schemaKey = '', schema = '', uiSchema = {}} = {}) {
        let transformerName = 'default';
        const transformerOptions = {
            schemaKey,
            schema,
            options: {}
        };

        if (schemaKey in uiSchema) {
            const instruction = uiSchema[schemaKey];

            if ('component' in instruction) {
                transformerName = instruction.component;
            }

            if ('options' in instruction) {
                transformerOptions.options = instruction.options;
            }
        }

        return transformers[transformerName](transformerOptions); // eslint-disable-line
    }

    // TODO: Move these in to modules
    const transformers = {
        default: ({schemaKey, schema, options} = {}) => {
            // base default instruction on schema type
            const transformer = transformers[schema.type];

            if (transformer) {
                return transformer({schemaKey, schema, options});
            }

            // if there is no type but there is a description, this is raw content
            if (schema.description) {
                return {
                    componentName: 'content',
                    content: schema.description
                };
            }

            throw Error(`No default transformer found for type "${schema.type}"`);
        },
        object: ({schemaKey, schema, options} = {}) =>
            transformers.govukForm({schemaKey, schema, options}),
        string: ({schemaKey, schema, options} = {}) => {
            if ('oneOf' in schema) {
                return transformers.govukRadios({schemaKey, schema, options});
            }

            return transformers.govukInput({schemaKey, schema, options});
        },
        govukForm: (() => {
            function toNunjucks(componentName, componentOptions, includeBrackets = true) {
                function stringifyNestedComponents(key, value) {
                    if (value && typeof value === 'object' && 'componentName' in value) {
                        // The nested component can't be quoted. Pre/postfix the quotes with _
                        // These can then be replaced e.g. '{"key": "_value_"}' becomes '{"key": value}'
                        return `_${toNunjucks(value.componentName, value.macroOptions, false)}_`;
                    }

                    return value;
                }

                const output = `${componentName}(${JSON.stringify(
                    componentOptions,
                    stringifyNestedComponents,
                    4 // Keep indentation in place to avoid minified objects becoming "}}" and breaking nunjucks
                )})`
                    .replace(/"_|_"/g, '') // Remove special quotes "_ & _"
                    .replace(/\\n/g, '\n') // Unescape nested component strings
                    .replace(/\\"/g, '"'); // Unescape nested component strings

                return includeBrackets ? `{{ ${output} }}` : output;
            }

            function form({schema, options} = {}) {
                let config = {};

                config = merge(config, options);

                // If there are no output properties default to all
                config.outputProperties = config.outputProperties || Object.keys(schema.properties);

                // Transform sub schemas
                const transformations = Object.keys(schema.properties).reduce(
                    (acc, subSchemaKey) => {
                        const subSchema = schema.properties[subSchemaKey];

                        // Is there a sub uiSchema
                        let subUISchema = {};
                        if (
                            options &&
                            'properties' in options &&
                            subSchemaKey in options.properties
                        ) {
                            subUISchema = {[subSchemaKey]: options.properties[subSchemaKey]};
                        }

                        acc[subSchemaKey] = transform({
                            schemaKey: subSchemaKey,
                            schema: subSchema,
                            uiSchema: subUISchema
                        });

                        return acc;
                    },
                    {}
                );

                if (config.outputProperties) {
                    const nunjucks = config.outputProperties.reduce((acc, outputProperty) => {
                        let transformation = transformations[outputProperty];

                        if (transformation.postTransformation) {
                            transformation = transformation.postTransformation(transformations);
                        }

                        const renderedInstruction = toNunjucks(
                            transformation.componentName,
                            transformation.macroOptions
                        );

                        acc.push(renderedInstruction);

                        return acc;
                    }, []);

                    return nunjucks.join('');
                }

                return transformations;
            }

            return form;
        })(),
        govukRadios: ({schemaKey, schema, options} = {}) => {
            const transformation = merge(
                {
                    componentName: 'govukRadios',
                    macroOptions: {
                        idPrefix: schemaKey,
                        name: schemaKey,
                        fieldset: {
                            legend: {
                                text: schema.title,
                                isPageHeading: true,
                                classes: 'govuk-fieldset__legend--xl'
                            }
                        },
                        hint: schema.description ? {text: schema.description} : null,
                        items: schema.oneOf.map(item => ({
                            value: item.const,
                            text: item.title
                        }))
                    }
                },
                options
            );

            if (Array.isArray(transformation.conditionalComponents)) {
                // The radios have conditionally revealing content
                // Wait until all transformations have happened
                transformation.postTransformation = transformations => {
                    transformation.conditionalComponents.forEach((componentId, i) => {
                        const siblingTransformation = transformations[componentId];
                        siblingTransformation.macroOptions.classes = 'govuk-!-width-one-third';

                        transformation.macroOptions.items[i].conditional = {
                            html: siblingTransformation
                        };
                    });

                    return transformation;
                };
            }

            return transformation;
        },
        govukInput: ({schemaKey, schema, options} = {}) => {
            const transformation = merge(
                {
                    componentName: 'govukInput',
                    macroOptions: {
                        id: schemaKey,
                        name: schemaKey,
                        type: schema.format === 'email' ? 'email' : 'text',
                        label: {
                            text: schema.title,
                            isPageHeading: true,
                            classes: 'govuk-label--xl'
                        },
                        hint: schema.description ? {text: schema.description} : null
                    }
                },
                options
            );

            return transformation;
        }
    };

    return Object.freeze({
        transform
    });
}

module.exports = createQTransformer;
