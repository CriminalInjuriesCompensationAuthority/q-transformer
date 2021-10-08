const merge = require('lodash.merge');
const createNunjucksHelper = require('../helpers/nunjucks');

const nunjucksHelper = createNunjucksHelper();

function getNunjucksImports(transformations) {
    const dependencies = new Set();

    Object.keys(transformations).forEach(id => {
        const transformation = transformations[id];

        transformation.dependencies.forEach(dependency => dependencies.add(dependency));
    });

    return Array.from(dependencies);
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

function allOf({schema, options, transform, data, schemaErrors} = {}) {
    const opts = merge({}, options);
    const groupSchema = schema.allOf[0];
    const pageHeading = groupSchema.title;

    // Transform sub schemas
    const transformations = groupSchema.allOf.reduce((acc, propertiesSchema) => {
        const {properties} = propertiesSchema;

        // Transform sub schemas
        Object.keys(properties).forEach(subSchemaKey => {
            const subSchema = properties[subSchemaKey];
            let subUISchema = {};

            // Is there a sub uiSchema
            if (options && 'properties' in options && subSchemaKey in options.properties) {
                subUISchema = merge(subUISchema, {
                    [subSchemaKey]: options.properties[subSchemaKey]
                });
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

            if (transformation.macroOptions && transformation.macroOptions.fieldset) {
                // `allOf` transformer wraps everything in a fieldset. remove the
                // config for nested fieldset with the "sub" transformation.
                delete transformation.macroOptions.fieldset;
            }

            acc[subSchemaKey] = transformation;
        });

        return acc;
    }, {});

    opts.outputOrder = opts.outputOrder || Object.keys(transformations);
    opts.transformOrder = opts.transformOrder || opts.outputOrder;

    const nunjucksImports = getNunjucksImports(transformations);

    const order = [...new Set([...opts.outputOrder, ...opts.transformOrder])];

    const summaryText = generateErrorSummary(order, transformations);

    return {
        content: `${summaryText}
            ${nunjucksImports.join('\n')}
            {% from "fieldset/macro.njk" import govukFieldset %}
            {% call govukFieldset({
                legend: {
                  html: "${pageHeading}",
                  classes: "govuk-fieldset__legend--xl",
                  isPageHeading: true
                }
            }) %}
            ${opts.outputOrder
                .map(property => {
                    const transformation = transformations[property];
                    if (
                        transformation.componentName === 'rawContent' ||
                        transformation.componentName === 'summary'
                    ) {
                        return transformation.content;
                    }

                    return nunjucksHelper.toNunjucks(
                        transformation.componentName,
                        transformation.macroOptions
                    );
                })
                .join('\n')}
            {% endcall %}`,
        pageTitle: pageHeading,
        hasErrors: !!summaryText
    };
}

module.exports = allOf;
