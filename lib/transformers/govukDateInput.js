const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options, data, schemaErrors} = {}) => {
    let opts = {
        id: schemaKey,
        dependencies: ['{% from "date-input/macro.njk" import govukDateInput %}'],
        componentName: 'govukDateInput',
        dateParts: {
            day: true,
            month: true,
            year: true
        },
        macroOptions: {
            id: schemaKey,
            fieldset: {
                legend: {
                    text: schema.title
                }
            },
            hint: schema.description ? {text: schema.description} : null,
            items: [
                {
                    label: 'Day',
                    classes: `govuk-input--width-2`,
                    name: `${schemaKey}[day]`
                },
                {
                    label: 'Month',
                    classes: `govuk-input--width-2`,
                    name: `${schemaKey}[month]`
                },
                {
                    label: 'Year',
                    classes: `govuk-input--width-4`,
                    name: `${schemaKey}[year]`
                }
            ]
        }
    };

    // Pre-populate with supplied data
    if (schemaKey in data) {
        // ISO date YYYY-MM-DD, 1980-02-01T00:00:00.000Z
        const ISODateString = data[schemaKey];
        // Get each date part from the string and convert to int
        const yearMonthDay = ISODateString.split('T')[0]
            .split('-')
            .map(datePart => parseInt(datePart, 10));

        [
            opts.macroOptions.items[2].value,
            opts.macroOptions.items[1].value,
            opts.macroOptions.items[0].value
        ] = yearMonthDay;
    }

    // Include errors
    if (opts.macroOptions.id in schemaErrors) {
        // The gds govukDateInput prefixes each item with the id. Given the component has the id 'bla'
        // The item inputs become "bla-bla[day]"
        // Not sure how to stop that?
        opts.errorSummaryHREF = `#${schemaKey}-${opts.macroOptions.items[0].name}`;

        opts.macroOptions.errorMessage = {
            text: schemaErrors[opts.macroOptions.id]
        };
        opts.macroOptions.items.forEach(item => {
            item.classes += ' govuk-input--error'; // eslint-disable-line
        });
    }

    // Override defaults
    opts = merge(opts, options);

    // Configure page heading
    if (opts.setPageHeading) {
        opts.macroOptions.fieldset.legend.isPageHeading = true;
        opts.macroOptions.fieldset.legend.classes = 'govuk-fieldset__legend--xl';
    }

    // Get only the date parts that should be displayed
    opts.macroOptions.items = opts.macroOptions.items.filter(item => {
        const datePart = item.label.toLowerCase();

        return opts.dateParts[datePart];
    });

    // transformation
    const transformation = {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };

    if (opts.errorSummaryHREF) {
        transformation.errorSummaryHREF = opts.errorSummaryHREF;
    }

    if (opts.autoComplete) {
        // add autocomplete to date fields. Only used for birthdays
        opts.macroOptions.items.forEach(item => {
            // eslint-disable-next-line no-param-reassign
            item.autocomplete = `bday-${item.label.toLowerCase()}`;
        });
    }

    return transformation;
};
