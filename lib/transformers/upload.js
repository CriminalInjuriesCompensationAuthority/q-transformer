const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "file-upload/macro.njk" import govukFileUpload %}'],
        componentName: 'govukFileUpload',
        macroOptions: {
            id: schemaKey,
            name: schemaKey,
            label: {
                html: schema.title
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };

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
