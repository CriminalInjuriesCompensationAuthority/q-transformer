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
                text: schema.title
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

    // Add classes to give an appropriate length of field

    if (schema.maxLength) {
        // default values will not have a maxLength attribute - only add this if you need to change it!
        if (schema.maxLength < 20) {
            // 25% field
            opts.macroOptions.classes = 'govuk-input--width-10';
        } else if (schema.maxLength >= 20 && schema.maxLength < 60) {
            // 50% field
            opts.macroOptions.classes = 'govuk-input--width-20';
        }
        // Greater than 60 will but less that 500 will return 75% field. Greater than 500 will render as a text area.
        else {
            opts.macroOptions.classes = 'govuk-input--width-30';
        }
    }

    // Override defaults
    opts = merge(opts, options);

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.label.isPageHeading = true;
        opts.macroOptions.label.classes = 'govuk-label--xl';
    }

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
