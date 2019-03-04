const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data} = {}) => {
    const transformation = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
            componentName: 'govukCheckboxes',
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
                items: schema.items.oneOf.map(subSchema => ({
                    value: subSchema.const,
                    text: subSchema.title
                }))
            }
        },
        options
    );

    // Pre-populate with supplied data
    if (transformation.macroOptions.name in data) {
        const values = data[transformation.macroOptions.name];

        values.forEach(value => {
            const checkedItem = transformation.macroOptions.items.find(
                item => item.value === value
            );

            if (!checkedItem) {
                throw Error(
                    `Unable to add "checked" attribute. No checkbox found for value: "${value}"`
                );
            }

            checkedItem.checked = true;
        });
    }

    return transformation;
};
