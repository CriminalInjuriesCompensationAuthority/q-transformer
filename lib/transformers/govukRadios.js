const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, transformations, data} = {}) => {
    const transformation = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
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
                items: schema.oneOf.map(subSchema => {
                    const item = {
                        value: subSchema.const,
                        text: subSchema.title
                    };

                    if (options.conditionalMapping) {
                        // Get conditional components
                        const conditionalComponentId = options.conditionalMapping[item.value];

                        if (!conditionalComponentId) {
                            throw Error(
                                `No conditional component mapping found for item value: "${
                                    item.value
                                }"`
                            );
                        }

                        const component = transformations[conditionalComponentId];

                        if (!component) {
                            throw Error(
                                `No transformation found for id: "${conditionalComponentId}"`
                            );
                        }

                        component.macroOptions.classes = 'govuk-!-width-one-third';

                        item.conditional = {
                            html: component
                        };
                    }

                    return item;
                })
            }
        },
        options
    );

    // Pre-populate with supplied data
    if (transformation.macroOptions.name in data) {
        const value = data[transformation.macroOptions.name];
        const checkedItem = transformation.macroOptions.items.find(item => item.value === value);

        checkedItem.checked = true;
    }

    return transformation;
};
