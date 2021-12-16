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

function schemaContent(schema, nunjucksImports, summaryText, transformations) {
    const componentsSchema = schema.allOf;
    function propertyNunjucks(propertySchema) {
        const {properties} = propertySchema;
        const propertyIds = Object.keys(properties);
        return propertyIds
            .map(propertyId => {
                const transformation = transformations[propertyId];
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
            .join('\n');
    }

    function beginFieldset(componentSchema) {
        return `{% from "fieldset/macro.njk" import govukFieldset %}
        {% call govukFieldset({
            legend: {
                html: "${componentSchema.title}",
                classes: "${
                    componentsSchema.length === 1
                        ? `govuk-fieldset__legend--xl`
                        : `govuk-fieldset__legend--m`
                }",
            isPageHeading: ${componentsSchema.length === 1}
            }
        }) %}`;
    }

    function componentContent(componentSchema) {
        if ('allOf' in componentSchema) {
            return `${beginFieldset(componentSchema)}
            ${componentSchema.allOf
                .map(propertySchema => {
                    return propertyNunjucks(propertySchema);
                })
                .join('\n')}
        {% endcall %}`;
        }

        if ('properties' in componentSchema) {
            return propertyNunjucks(componentSchema);
        }
        return '';
    }

    return `${summaryText}${nunjucksImports.join('\n')}
            ${schema.title ? `<h1 class="govuk-heading-xl">${schema.title}</h1>` : ''}
            ${componentsSchema
                .map(componentSchema => {
                    return `${componentContent(componentSchema)}`;
                })
                .join('\n')}`;
}

function transformComponentSchema(componentSchema, options, transform, data, schemaErrors) {
    function transformPropertySchema(acc, propertiesSchema) {
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

            acc[subSchemaKey] = transformation;
        });
        return acc;
    }

    if ('allOf' in componentSchema) {
        return componentSchema.allOf.reduce((acc, propertiesSchema) => {
            return transformPropertySchema(acc, propertiesSchema);
        }, {});
    }
    const propertySchema = {properties: componentSchema.properties};
    return transformPropertySchema({}, propertySchema);
}

function getPageHeading(schema) {
    // is title present at schema level?
    if (schema.title !== undefined) {
        return schema.title;
    }

    const components = schema.allOf;
    // is title present on first element allOf?
    let pageHeading = components[0].title;
    if (!pageHeading) {
        // it's not present, get the title from a standard questions properties schema
        const keys = Object.keys(components[0].properties);
        pageHeading = components[0].properties[keys[0]].title;
    }
    return pageHeading;
}

function allOf({schema, options, transform, data, schemaErrors} = {}) {
    const opts = merge({}, options);
    const componentsSchema = schema.allOf;
    const pageHeading = getPageHeading(schema);

    // hanlde multiple components/sections defined within allOf
    const transformations = componentsSchema.reduce((outerAcc, componentSchema) => {
        // Transform sections
        const componentTransformations = transformComponentSchema(
            componentSchema,
            options,
            transform,
            data,
            schemaErrors
        );

        return Object.assign(outerAcc, componentTransformations);
    }, {});

    opts.outputOrder = opts.outputOrder || Object.keys(transformations);
    opts.transformOrder = opts.transformOrder || opts.outputOrder;
    const nunjucksImports = getNunjucksImports(transformations);
    const order = [...new Set([...opts.outputOrder, ...opts.transformOrder])];
    const summaryText = generateErrorSummary(order, transformations);
    const schemaNunjucks = schemaContent(schema, nunjucksImports, summaryText, transformations);

    return {
        content: schemaNunjucks,
        pageTitle: pageHeading,
        hasErrors: !!summaryText
    };
}
module.exports = allOf;
