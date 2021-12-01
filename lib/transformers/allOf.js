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

function getSchemaPropertiesTransformations({
    schemaProperties,
    options,
    transform,
    transformations,
    data,
    schemaErrors
}) {
    // iterate through question ids.
    Object.keys(schemaProperties).forEach(property => {
        const subSchema = schemaProperties[property];
        let subUISchema = {};

        // is there a sub uiSchema?
        if (options && 'properties' in options && property in options.properties) {
            subUISchema = merge(subUISchema, {
                [property]: options.properties[property]
            });
        }

        // Do transform. Pass in all transformations thus far.
        const transformation = transform({
            schemaKey: property,
            schema: subSchema,
            uiSchema: subUISchema,
            transformations,
            data,
            schemaErrors
        });
        transformations[property] = transformation;
    });
    return transformations;
}

function transformCollectionItem({item, options, transform, data, schemaErrors}) {
    // is it a schema with properties (i.e. question ids)?
    if ('properties' in item) {
        return getSchemaPropertiesTransformations({
            schemaProperties: item.properties,
            options,
            transform,
            transformations: {},
            data,
            schemaErrors
        });
    }

    // assuming it is an `allOf` (with child `properties`).
    return item.allOf.reduce(
        (transformations, subItem) =>
            getSchemaPropertiesTransformations({
                schemaProperties: subItem.properties,
                options,
                transform,
                transformations,
                data,
                schemaErrors
            }),
        {}
    );
}

function getPageHeading(schema) {
    // is title present at schema level?
    if (schema.title !== undefined) {
        return schema.title;
    }

    const collection = schema.allOf;
    // is title present on first element allOf?
    let pageHeading = collection[0].title;
    if (!pageHeading) {
        // it's not present, get the title from a standard questions properties schema
        const keys = Object.keys(collection[0].properties);
        pageHeading = collection[0].properties[keys[0]].title;
    }
    return pageHeading;
}

function buildCollectionNunjucks(propertiesSchema, transformations) {
    const propertyIds = Object.keys(propertiesSchema);
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

function buildNunjucks(schema, nunjucksImports, summaryText, transformations) {
    const collection = schema.allOf;
    const isSingleNestedAllOf = collection.length === 1;

    return `${summaryText}${nunjucksImports.join('\n')}
            ${schema.title ? `<h1 class="govuk-heading-xl">${schema.title}</h1>` : ''}
            ${collection
                .map(item => {
                    if ('properties' in item) {
                        return buildCollectionNunjucks(item.properties, transformations);
                    }

                    if ('allOf' in item) {
                        return `
                                {% from "fieldset/macro.njk" import govukFieldset %}
                                    {% call govukFieldset({
                                        legend: {
                                            html: "${item.title}",
                                            classes: "${
                                                isSingleNestedAllOf
                                                    ? `govuk-fieldset__legend--xl`
                                                    : `govuk-fieldset__legend--m`
                                            }",
                                            isPageHeading: ${!!isSingleNestedAllOf}
                                        }
                                    }) %}
                                    ${item.allOf
                                        .map(subItem =>
                                            buildCollectionNunjucks(
                                                subItem.properties,
                                                transformations
                                            )
                                        )
                                        .join('\n')}
                                {% endcall %}`;
                    }

                    return '';
                })
                .join('\n')}`;
}

function allOf({schema, options, transform, data, schemaErrors} = {}) {
    const opts = merge({}, options);
    const collection = schema.allOf;
    const pageHeading = getPageHeading(schema);

    // handle multiple components/sections defined within allOf
    const transformations = collection.reduce((acc, item) => {
        const subSchemaTransformation = transformCollectionItem({
            item,
            options,
            transform,
            data,
            schemaErrors
        });

        return Object.assign(acc, subSchemaTransformation);
    }, {});

    opts.outputOrder = opts.outputOrder || Object.keys(transformations);
    opts.transformOrder = opts.transformOrder || opts.outputOrder;
    const nunjucksImports = getNunjucksImports(transformations);
    const order = [...new Set([...opts.outputOrder, ...opts.transformOrder])];
    const summaryText = generateErrorSummary(order, transformations);
    const nunjucksMarkup = buildNunjucks(schema, nunjucksImports, summaryText, transformations);

    return {
        content: nunjucksMarkup,
        pageTitle: pageHeading,
        hasErrors: !!summaryText
    };
}
module.exports = allOf;
