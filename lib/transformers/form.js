const merge = require('lodash.merge');

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

function form({schema, options, transform} = {}) {
    let config = {};

    config = merge(config, options);

    // If there are no output properties default to all
    config.outputOrder = config.outputOrder || Object.keys(schema.properties);

    // If there is no transformation order default to property order
    config.transformOrder = config.transformOrder || Object.keys(schema.properties);

    // Transform sub schemas
    const transformations = config.transformOrder.reduce((acc, subSchemaKey) => {
        const subSchema = schema.properties[subSchemaKey];

        // Is there a sub uiSchema
        let subUISchema = {};
        if (options && 'properties' in options && subSchemaKey in options.properties) {
            subUISchema = {[subSchemaKey]: options.properties[subSchemaKey]};
        }

        // Do transform. Pass in all transformations thus far.
        acc[subSchemaKey] = transform({
            schemaKey: subSchemaKey,
            schema: subSchema,
            uiSchema: subUISchema,
            transformations: acc
        });

        return acc;
    }, {});

    const nunjucksImports = Object.keys(
        config.outputOrder.reduce((acc, property) => {
            transformations[property].dependencies.forEach(dependency => {
                acc[dependency] = true;
            });

            return acc;
        }, {})
    );

    return `
        <form method="post">
            {% from "button/macro.njk" import govukButton %}
            ${nunjucksImports.join('\n')}
            ${config.outputOrder
                .map(property => {
                    const transformation = transformations[property];

                    return toNunjucks(transformation.componentName, transformation.macroOptions);
                })
                .join('\n')}
            {{ govukButton({
                text: "Continue"
            }) }}
        </form>`;
}

module.exports = form;
