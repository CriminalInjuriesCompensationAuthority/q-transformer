const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options} = {}) => {
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

    return transformation;
};
