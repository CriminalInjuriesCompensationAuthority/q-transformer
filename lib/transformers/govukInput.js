const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data, schemaErrors} = {}) => {
    let opts = {
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
    };

    // Pre-populate with supplied data
    if (opts.macroOptions.name in data) {
        opts.macroOptions.value = data[opts.macroOptions.name];
    }

    // Include errors
    if (opts.macroOptions.name in schemaErrors) {
        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.name]
        };
    }

    // Override defaults
    opts = merge(opts, options);

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
