const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, transformations, data, schemaErrors} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
        componentName: 'govukRadios',
        conditionalComponentMap: false,
        macroOptions: {
            idPrefix: schemaKey,
            name: schemaKey,
            fieldset: {
                legend: {
                    text: schema.title
                }
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };

    // Include errors
    if (opts.macroOptions.name in schemaErrors) {
        opts.errorSummaryHREF = `#${opts.macroOptions.name}-1`;
        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.name]
        };
    }

    // Setup items
    opts.macroOptions.items = schema.oneOf.map(subSchema => {
        const item = {
            value: subSchema.const,
            text: subSchema.title
        };

        // Pre-populate with supplied data
        if (opts.macroOptions.name in data) {
            const value = data[opts.macroOptions.name];

            // If this item's value is included in the values, set it to checked
            if (value === item.value) {
                item.checked = true;
            }
        }

        return item;
    });

    // Override defaults
    opts = merge(opts, options);

    // Setup conditional components
    if (opts.conditionalComponentMap) {
        /*
            conditionalComponentMap: [
                {
                    itemValue: 'email',
                    componentIds: ['email']
                },
                {
                    itemValue: 'phone',
                    componentIds: ['phone']
                },
                {
                    itemValue: 'text',
                    componentIds: ['text']
                }
            ]
        */
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

                // As this component will be nested, change its presentation
                // TODO: how to handle existing classes?
                // component.macroOptions.classes = 'govuk-!-width-one-third';

                return component;
            });

            // Assign conditional components to the item
            item.conditional = {
                html: components
            };
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
