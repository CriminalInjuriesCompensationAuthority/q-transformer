const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
        componentName: 'govukCheckboxes',
        macroOptions: {
            // [] in name ensures req will be treated as an array, even if only a single checkbox is checked
            name: `${schemaKey}[]`,
            fieldset: {
                legend: {
                    text: schema.title
                }
            },
            hint: schema.description ? {text: schema.description} : null
        }
    };

    // Setup items
    opts.macroOptions.items = schema.items.anyOf.map(subSchema => {
        const item = {
            value: subSchema.const,
            text: subSchema.title
        };

        // Pre-populate with supplied data
        if (schemaKey in data) {
            // Values will be an array of checkbox values e.g. [ 'mines', 'farm', ...]
            const values = data[schemaKey];

            // If this item's value is included in the values, set it to checked
            if (values.includes(item.value)) {
                item.checked = true;
            }
        }

        return item;
    });

    // Override defaults
    opts = merge(opts, options);

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.fieldset.legend.isPageHeading = true;
        opts.macroOptions.fieldset.legend.classes = 'govuk-fieldset__legend--xl';
    }

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
