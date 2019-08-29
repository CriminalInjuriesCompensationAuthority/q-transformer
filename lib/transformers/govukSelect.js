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
            if (values === item.value) {
                item.selected = true;
            }
        }

        return item;
    });

    // Add default selection to items
    const placeholder = {
        value: '',
        text: 'Please select...'
    };

    opts.macroOptions.items.unshift(placeholder);

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

    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
