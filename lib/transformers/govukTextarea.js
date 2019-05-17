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
                text: schema.title
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };

    // Pre-populate with supplied data
    if (opts.macroOptions.name in data) {
        opts.macroOptions.value = data[opts.macroOptions.name];
    }

    // include errors.
    if (schemaErrors.errors) {
        schemaErrors.errors.forEach(error => {
            const questionId = error.source.pointer.replace('#/', '');
            if (opts.macroOptions.name === questionId) {
                opts.macroOptions.errorMessage = {
                    text: error.detail
                };
            }
        });
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
