const merge = require('lodash.merge');

function toNunjucks(componentName, componentOptions, includeBrackets = true) {
    function stringifyNestedComponents(key, value) {
        if (key === 'html') {
            if (Array.isArray(value)) {
                const instructions = value.map(instruction =>
                    toNunjucks(instruction.componentName, instruction.macroOptions, false)
                );

                // Nunjucks join syntax - ([emailHtml, phoneHtml] | join())
                // The nested component string can't be quoted. Pre/postfix the quotes with _
                // These can then be replaced e.g. '{"key": "_value_"}' becomes '{"key": value}'
                return `_([\n${instructions.join(',\n')}\n] | join())_`;
            }
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

function getNunjucksImports(outputOrder, transformations) {
    return Object.keys(
        outputOrder.reduce((acc, property) => {
            const transformation = transformations[property];

            transformation.dependencies.forEach(dependency => {
                acc[dependency] = true;
            });

            return acc;
        }, {})
    );
}

function form({schema, options, transform, data} = {}) {
    let opts = {};

    opts = merge(opts, options);

    // If there are no output properties default to all
    opts.outputOrder = opts.outputOrder || Object.keys(schema.properties);

    // If there is no transformation order default to property order
    opts.transformOrder = opts.transformOrder || Object.keys(schema.properties);

    // Transform sub schemas
    const transformations = opts.transformOrder.reduce((acc, subSchemaKey) => {
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
            transformations: acc,
            data
        });

        return acc;
    }, {});

    const nunjucksImports = getNunjucksImports(opts.outputOrder, transformations);

    return `
        <form method="post">
            {% from "button/macro.njk" import govukButton %}
            ${nunjucksImports.join('\n')}
            ${schema.title ? `<h1 class="govuk-heading-xl">${schema.title}</h1>` : ''}
            ${opts.outputOrder
                .map(property => {
                    const transformation = transformations[property];

                    if (transformation.componentName === 'rawContent') {
                        return transformation.content;
                    }

                    return toNunjucks(transformation.componentName, transformation.macroOptions);
                })
                .join('\n')}
            {{ govukButton({
                text: "Continue"
            }) }}
        </form>`;
}

module.exports = form;
