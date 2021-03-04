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
                    id: `${schemaKey}[day]`,
                    name: `${schemaKey}[day]`,
                    attributes: {
                        maxlength: '2'
                    }
                },
                {
                    label: 'Month',
                    classes: `govuk-input--width-2`,
                    id: `${schemaKey}[month]`,
                    name: `${schemaKey}[month]`,
                    attributes: {
                        maxlength: '2'
                    }
                },
                {
                    label: 'Year',
                    classes: `govuk-input--width-4`,
                    id: `${schemaKey}[year]`,
                    name: `${schemaKey}[year]`,
                    attributes: {
                        maxlength: '4'
                    }
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
        const yearMonth = yearMonthDay.slice(0, -1);
        if (!opts.dateParts.day) {
            [opts.macroOptions.items[1].value, opts.macroOptions.items[0].value] = yearMonth;
        } else {
            [
                opts.macroOptions.items[2].value,
                opts.macroOptions.items[1].value,
                opts.macroOptions.items[0].value
            ] = yearMonthDay;
        }
    }

    // Include errors
    if (opts.macroOptions.id in schemaErrors) {
        opts.errorSummaryHREF = `#${opts.macroOptions.items[0].name}`;

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

    if (opts.macroOptions.autocomplete) {
        opts.macroOptions.items[0].autocomplete = `${options.macroOptions.autocomplete}-day`;
        opts.macroOptions.items[1].autocomplete = `${options.macroOptions.autocomplete}-month`;
        opts.macroOptions.items[2].autocomplete = `${options.macroOptions.autocomplete}-year`;
        delete opts.macroOptions.autocomplete;
    }

    // Get only the date parts that should be displayed
    opts.macroOptions.items = opts.macroOptions.items.filter(
        item => opts.dateParts[item.label.toLowerCase()]
    );

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

    return transformation;
};
