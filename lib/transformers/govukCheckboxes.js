const merge = require('lodash.merge');
const createStringHelper = require('../helpers/string');

module.exports = ({schemaKey, schema, options, transformations, data, schemaErrors} = {}) => {
    const stringHelper = createStringHelper();
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
        componentName: 'govukCheckboxes',
        macroOptions: {
            idPrefix: schemaKey,
            // [] in name ensures req will be treated as an array, even if only a single checkbox is checked
            name: `${schemaKey}[]`,
            fieldset: {
                legend: {
                    text: schema.title
                }
            },
            hint: schema.description ? {html: schema.description} : null
        }
    };

    // render as single checkbox if in this shape.
    if ('const' in schema) {
        const item = JSON.parse(JSON.stringify(schema));
        delete item.type;
        schema.items = {
            anyOf: [item]
        };
        // single fields do not need to be in a fieldset.
        delete opts.macroOptions.fieldset;
        delete opts.macroOptions.hint;
        // needs to be a string.
        opts.macroOptions.name = opts.macroOptions.name.replace('[]', '');
    }

    // Setup items
    opts.macroOptions.items = schema.items.anyOf.map(subSchema => {
        const item = {
            value: subSchema.const
        };

        if (stringHelper.containsHtml(subSchema.title)) {
            item.html = subSchema.title;
        } else {
            item.text = subSchema.title;
        }

        if (subSchema.description) {
            item.hint = {
                text: subSchema.description
            };
        }

        // Pre-populate with supplied data
        if (schemaKey in data) {
            // Values will be an array of checkbox values e.g. [ 'mines', 'farm', ...]
            const values = data[schemaKey];

            // If this item's value is included in the values, set it to checked
            if (values.includes(item.value)) {
                item.checked = true;
            }
        }

        return item;
    });

    // Include errors
    if (schemaKey in schemaErrors) {
        opts.errorSummaryHREF = `#${opts.macroOptions.name}`;
        opts.macroOptions.errorMessage = {
            text: schemaErrors[schemaKey]
        };
    }

    // Override defaults
    opts = merge(opts, options);

    if (opts.conditionalComponentMap) {
        opts.conditionalComponentMap.forEach(mapping => {
            // Get the item the map applies to
            const item = opts.macroOptions.items.find(
                testItem => testItem.value === mapping.itemValue
            );

            if (!item) {
                throw Error(
                    `No conditional component mapping found for item value: "${mapping.itemValue}"`
                );
            }

            // Get the components that should be associated with this item
            const components = mapping.componentIds.map(componentId => {
                // All previous transformations are available from the "transformations" param
                const component = transformations[componentId];

                if (!component) {
                    throw Error(`No transformation found for component id: "${componentId}"`);
                }

                return component;
            });

            // Assign conditional components to the item
            item.conditional = {
                html: components
            };
        });
    }

    // Add additional mappings if present

    if (opts.additionalMapping) {
        opts.additionalMapping.forEach(item => {
            const newMapping = {};
            newMapping[item.itemType] = item.itemValue;
            opts.macroOptions.items.splice(item.itemIndex, 0, newMapping);
        });
    }

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.fieldset.legend.isPageHeading = true;
        opts.macroOptions.fieldset.legend.classes = 'govuk-fieldset__legend--xl';
    }

    // transformation
    const transformation = {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };

    if (opts.errorSummaryHREF) {
        transformation.errorSummaryHREF = opts.errorSummaryHREF;
    }

    return transformation;
};
