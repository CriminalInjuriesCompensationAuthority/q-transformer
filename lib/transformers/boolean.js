// TODO: This module is a bit hacky, can it be handled in a better way?
const govukRadios = require('./govukRadios');

module.exports = ({schemaKey, schema, options, transformations, data} = {}) => {
    // eslint-disable-next-line
    schema.oneOf = [
        {
            title: 'Yes',
            const: true
        },
        {
            title: 'No',
            const: false
        }
    ];

    // eslint-disable-next-line
    options.macroOptions = {
        classes: 'govuk-radios--inline'
    };

    return govukRadios({schemaKey, schema, options, transformations, data});
};
