const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data, schemaErrors} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
        componentName: 'govukSelect',
        macroOptions: {
            name: schemaKey,
            label: {
                text: schema.title
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };

    opts.macroOptions.items = schema.oneOf.map(subSchema => {
        const item = {
            value: subSchema.const,
            text: subSchema.title
        };

        // Pre-populate with supplied data
        if (schemaKey in data) {
            const values = data[schemaKey];

            // If this item's value is included in the values, set it to selected
            if (values.includes(item.value)) {
                item.selected = true;
            }
        }

        return item;
    });

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

    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
