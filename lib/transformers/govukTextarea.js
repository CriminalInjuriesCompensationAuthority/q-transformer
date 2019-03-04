const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data} = {}) => {
    const transformation = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "textarea/macro.njk" import govukTextarea %}'],
            componentName: 'govukTextarea',
            macroOptions: {
                id: schemaKey,
                name: schemaKey,
                label: {
                    text: schema.title,
                    isPageHeading: true,
                    classes: 'govuk-label--xl'
                },
                hint: schema.description ? {text: schema.description} : null
            }
        },
        options
    );

    // Pre-populate with supplied data
    if (transformation.macroOptions.name in data) {
        const value = data[transformation.macroOptions.name];

        transformation.macroOptions.value = value;
    }

    return transformation;
};
