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
    const pageTitle = [];

    opts.macroOptions.items = schema.oneOf.map(subSchema => {
        const item = {
            value: subSchema.const,
            text: subSchema.title
        };

        // Pre-populate with supplied data
        if (schemaKey in data) {
            const value = data[schemaKey];

            // If this item's value is included in the values, set it to selected
            if (value === item.value) {
                item.selected = true;
            }
        }

        return item;
    });

    // Include errors
    if (opts.macroOptions.name in schemaErrors) {
        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.name]
        };
        pageTitle.push('Error: ');
    }

    // Override defaults
    opts = merge(opts, options);

    // Add default item to items
    if (opts.defaultItem) {
        // Unselect if the list is already pre-populated
        const prePopulatedIndex = opts.macroOptions.items.findIndex(item => item.selected);

        if (prePopulatedIndex > -1) {
            opts.defaultItem.selected = false;
        }

        opts.macroOptions.items.unshift(opts.defaultItem);
    }

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.label.isPageHeading = true;
        opts.macroOptions.label.classes = 'govuk-label--xl';
        pageTitle.push(
            `${opts.macroOptions.fieldset.legend.text || opts.macroOptions.fieldset.legend.html}`
        );
    }

    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions,
        pageTitle: pageTitle.join('')
    };
};
