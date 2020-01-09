const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, schemaErrors} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "file-upload/macro.njk" import govukFileUpload %}'],
        componentName: 'govukFileUpload',
        macroOptions: {
            id: schemaKey,
            name: schemaKey,
            label: {
                html: schema.title
            }
        }
    };

    // Include errors
    if (opts.macroOptions.name in schemaErrors) {
        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.name]
        };
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
