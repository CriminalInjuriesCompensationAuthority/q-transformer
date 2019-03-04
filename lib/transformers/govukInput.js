const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options} = {}) => {
    const transformation = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "input/macro.njk" import govukInput %}'],
            componentName: 'govukInput',
            macroOptions: {
                id: schemaKey,
                name: schemaKey,
                type: schema.format === 'email' ? 'email' : 'text',
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

    return transformation;
};
