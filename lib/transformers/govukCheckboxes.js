const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data, schemaErrors} = {}) => {
    let opts = {
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
            hint: schema.description ? {text: schema.description} : null
        }
    };

    // Setup items
    opts.macroOptions.items = schema.items.oneOf.map(subSchema => {
        const item = {
            value: subSchema.const,
            text: subSchema.title
        };

        // Pre-populate with supplied data
        if (opts.macroOptions.name in data) {
            // Values will be an array of checkbox values e.g. [ 'mines', 'farm', ...]
            const values = data[opts.macroOptions.name];

            // If this item's value is included in the values, set it to checked
            if (values.includes(item.value)) {
                item.checked = true;
            }
        }

        return item;
    });

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
