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

function getNunjucksImports(transformationOrder, transformations) {
    return Object.keys(
        transformationOrder.reduce((acc, property) => {
            const transformation = transformations[property];

            transformation.dependencies.forEach(dependency => {
                acc[dependency] = true;
            });

            return acc;
        }, {})
    );
}

function generateErrorSummary(transformationOrder, transformations) {
    const errors = transformationOrder.reduce((acc, property) => {
        const transformation = transformations[property];

        if ('macroOptions' in transformation && 'errorMessage' in transformation.macroOptions) {
            const errorObj = {
                href: `#${transformation.macroOptions.name}`,
                text: transformation.macroOptions.errorMessage.text
            };

            // Some inputs consist of multiple things e.g. radios, checkboxes, dates
            // These inputs will set their own error summary href to correspond with their first item
            if (transformation.errorSummaryHREF) {
                errorObj.href = transformation.errorSummaryHREF;
            }

            acc.push(errorObj);
        }

        return acc;
    }, []);

    return errors.length
        ? `{% from "error-summary/macro.njk" import govukErrorSummary %}
              {{ govukErrorSummary({
                titleText: "There is a problem",
                errorList: ${JSON.stringify(errors, null, 4)}}) }}`
        : '';
}

function form({schemaKey, schema, options, transform, data, schemaErrors} = {}) {
    let opts = {};

    opts = merge(opts, options);

    // If there are no output properties default to all
    opts.outputOrder = opts.outputOrder || Object.keys(schema.properties);

    // If there is no transformation order default to property order
    opts.transformOrder = opts.transformOrder || Object.keys(schema.properties);

    // Transform sub schemas
    const transformations = opts.transformOrder.reduce((acc, subSchemaKey) => {
        const subSchema = schema.properties[subSchemaKey];
        let subUISchema = {};

        if (!subSchema) {
            throw Error(
                `Schema "${schemaKey}" does not contain a sub schema for property: "${subSchemaKey}". This may be due to an invalid property name in transformOrder.`
            );
        }

        // Handle titles
        // If there's no top level title then make the first component of outputOrder the page heading
        if (!('title' in schema) && opts.outputOrder.indexOf(subSchemaKey) === 0) {
            subUISchema[subSchemaKey] = {
                options: {
                    setPageHeading: true
                }
            };
        }

        // Is there a sub uiSchema
        if (options && 'properties' in options && subSchemaKey in options.properties) {
            subUISchema = merge(subUISchema, {[subSchemaKey]: options.properties[subSchemaKey]});
        }

        // Do transform. Pass in all transformations thus far.
        const transformation = transform({
            schemaKey: subSchemaKey,
            schema: subSchema,
            uiSchema: subUISchema,
            transformations: acc,
            data,
            schemaErrors
        });

        acc[subSchemaKey] = transformation;

        return acc;
    }, {});

    const nunjucksImports = getNunjucksImports(opts.transformOrder, transformations);
    const summaryText = generateErrorSummary(opts.transformOrder, transformations);
    const buttonTitle = opts.isSummary ? 'Agree and Submit' : 'Continue';

    return `${summaryText}
        <form method="post">
            {% from "button/macro.njk" import govukButton %}
            ${nunjucksImports.join('\n')}
            ${schema.title ? `<h1 class="govuk-heading-xl">${schema.title}</h1>` : ''}
            ${opts.outputOrder
                .map(property => {
                    const transformation = transformations[property];
                    if (
                        transformation.componentName === 'rawContent' ||
                        transformation.componentName === 'summary'
                    ) {
                        return transformation.content;
                    }

                    return toNunjucks(transformation.componentName, transformation.macroOptions);
                })
                .join('\n')}
            {{ govukButton({
                text: "${buttonTitle}"
            }) }}
        </form>`;
}

module.exports = form;
