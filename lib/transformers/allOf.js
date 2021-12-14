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

function sectionSchemaTransformations(
    sectionSchema,
    options,
    transform,
    data,
    schemaErrors,
    sectionPropertyOrder
) {
    function transformPropertySchema(acc, propertiesSchema, propertyOrder) {
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
            propertyOrder.push(subSchemaKey);
        });
        return acc;
    }

    const propertyOrder = [];
    let transformedPropertySchema = {};
    if ('allOf' in sectionSchema) {
        transformedPropertySchema = sectionSchema.allOf.reduce((acc, propertiesSchema) => {
            return transformPropertySchema(acc, propertiesSchema, propertyOrder);
        }, {});
    } else {
        const propertySchema = {properties: sectionSchema.properties};
        transformedPropertySchema = transformPropertySchema({}, propertySchema, propertyOrder);
    }
    sectionPropertyOrder.push(propertyOrder);
    return transformedPropertySchema;
}

function getPageTitle(schema) {
    // is title present at schema level?
    if (schema.title !== undefined) {
        return schema.title;
    }

    const sectionSchemaCollection = schema.allOf;
    // is title present on first element allOf?
    let pageHeading = sectionSchemaCollection[0].title;
    if (!pageHeading) {
        // it's not present, get the title from a standard questions properties schema
        const keys = Object.keys(sectionSchemaCollection[0].properties);
        pageHeading = sectionSchemaCollection[0].properties[keys[0]].title;
    }
    return pageHeading;
}

function allOf({schema, options, transform, data, schemaErrors} = {}) {
    const opts = merge({}, options);
    const sectionSchemaCollection = schema.allOf;
    const pageHeading = getPageTitle(schema);
    const sectionPropertyOrder = [];

    // hanlde multiple components/schemas defined within allOf
    const transformations = sectionSchemaCollection.reduce((outerAcc, sectionSchema) => {
        // Transform sections
        const sectionSchemaTransformation = sectionSchemaTransformations(
            sectionSchema,
            options,
            transform,
            data,
            schemaErrors,
            sectionPropertyOrder
        );

        return Object.assign(outerAcc, sectionSchemaTransformation);
    }, {});

    opts.outputOrder = opts.outputOrder || Object.keys(transformations);
    opts.transformOrder = opts.transformOrder || opts.outputOrder;
    const nunjucksImports = getNunjucksImports(transformations);
    const order = [...new Set([...opts.outputOrder, ...opts.transformOrder])];
    const summaryText = generateErrorSummary(order, transformations);

    // ensure each sections property order corresponds to output|transform order when key value properties
    // and not allOf array
    // e.g. {key2: value, key1:value} to  [[key1, key2], [...], [...]]
    sectionPropertyOrder.forEach((propertyArray, index) => {
        const reOrderedProperties = [];
        order.forEach(propertyId => {
            if (propertyArray.includes(propertyId)) {
                reOrderedProperties.push(propertyId);
            }
        });
        sectionPropertyOrder[index] = reOrderedProperties;
    });

    function beginFieldset(index) {
        let fieldsetNunjucks = ``;
        const legendClass =
            sectionSchemaCollection.length === 1
                ? 'govuk-fieldset__legend--xl'
                : 'govuk-fieldset__legend--m';
        fieldsetNunjucks += `{% from "fieldset/macro.njk" import govukFieldset %}`;
        fieldsetNunjucks += `
                        {% call govukFieldset({
                        legend: {
                          html: "${sectionSchemaCollection[index].title}",
                          classes: "${legendClass}",
                          isPageHeading: ${sectionSchemaCollection.length === 1}
                        }
                    }) %}
                    `;
        return fieldsetNunjucks;
    }

    function endFieldset() {
        return '\n{% endcall %}';
    }

    return {
        content: `${summaryText}${nunjucksImports.join('\n')}
        ${schema.title ? `<h1 class="govuk-heading-xl">${schema.title}</h1>` : ''}
            ${sectionPropertyOrder
                .map((propertyOrder, index) => {
                    let nunjucks = '';
                    // is this an allOf/composite?
                    if ('allOf' in sectionSchemaCollection[index]) {
                        nunjucks += beginFieldset(index);
                    }
                    const propertyNunjucks = propertyOrder
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
                    nunjucks += propertyNunjucks;
                    if ('allOf' in sectionSchemaCollection[index]) {
                        nunjucks += endFieldset();
                    }
                    return nunjucks;
                })
                .join('\n')}`,
        pageTitle: pageHeading,
        hasErrors: !!summaryText
    };
}
module.exports = allOf;