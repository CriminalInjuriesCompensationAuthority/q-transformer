const merge = require('lodash.merge');
const moment = require('moment');

module.exports = ({schemaKey, schema, options, data} = {}) => {
    const opts = merge(
        {
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
                        text: schema.title,
                        isPageHeading: true,
                        classes: 'govuk-fieldset__legend--xl'
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
        },
        options
    );

    let inputDate;

    // Parse the date from the data
    if (schemaKey in data) {
        const ISODateString = data[schemaKey];
        inputDate = moment(ISODateString);
    }

    // Pre-populate with supplied data
    if (inputDate) {
        opts.macroOptions.items.forEach(item => {
            if (item.label === 'Day') {
                // eslint-disable-next-line
                item.value = inputDate.date();
            }

            if (item.label === 'Month') {
                // eslint-disable-next-line
                item.value = inputDate.month() + 1;
            }

            if (item.label === 'Year') {
                // eslint-disable-next-line
                item.value = inputDate.year();
            }
        });
    }

    // Get only the date parts that should be displayed
    opts.macroOptions.items = opts.macroOptions.items.filter(item => {
        const datePart = item.label.toLowerCase();

        return opts.dateParts[datePart];
    });

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        macroOptions: opts.macroOptions
    };
};
