const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data, schemaErrors} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "textarea/macro.njk" import govukTextarea %}'],
        componentName: 'govukTextarea',
        macroOptions: {
            id: schemaKey,
            name: schemaKey,
            label: {
                text: schema.title,
                classes: 'govuk-label govuk-label--l'
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };
    const pageTitle = [];

    // Pre-populate with supplied data
    if (opts.macroOptions.name in data) {
        opts.macroOptions.value = data[opts.macroOptions.name];
    }

    // Include errors
    if (opts.macroOptions.name in schemaErrors) {
        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.name]
        };
        pageTitle.push('Error: ');
    }

    // Override defaults
    opts = merge(opts, options);

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.label.isPageHeading = true;
        opts.macroOptions.label.classes = 'govuk-label--xl';
        pageTitle.push(`${opts.macroOptions.label.text || opts.macroOptions.label.html}`);
    }

    if (opts.autoComplete) {
        // add autocomplete to input fields
        opts.macroOptions.autocomplete = opts.autoComplete;
    }

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions,
        pageTitle: pageTitle.join('')
    };
};
