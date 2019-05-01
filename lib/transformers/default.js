const govukInput = require('./govukInput');
const govukRadios = require('./govukRadios');
const govukCheckboxes = require('./govukCheckboxes');
const govukTextarea = require('./govukTextarea');
const govukDateInput = require('./govukDateInput');
const rawContent = require('./rawContent');
const boolean = require('./boolean');
const form = require('./form');
const govukSelect = require('./govukSelect');
const summary = require('./summary');

// TODO: Tidy these args up e.g. duplicated in function body
module.exports = ({
    schemaKey,
    schema,
    options,
    transformations,
    transform,
    data,
    schemaErrors
} = {}) => {
    const args = {schemaKey, schema, options, transformations, transform, data, schemaErrors};
    // base default instruction on schema type
    if (schema.type === 'string' || schema.type === 'integer') {
        if ('maxLength' in schema && schema.maxLength >= 500) {
            return govukTextarea(args);
        }

        if ('oneOf' in schema) {
            if (schema.oneOf.length < 20) {
                return govukRadios(args);
            }
            return govukSelect(args);
        }

        if ('format' in schema && schema.format === 'date-time') {
            return govukDateInput(args);
        }

        return govukInput(args);
    }

    if (schema.type === 'array') {
        return govukCheckboxes(args);
    }

    if (schema.type === 'object') {
        return form(args);
    }

    if (schema.type === 'boolean') {
        return boolean(args);
    }

    // if there is no type but there is a description, this is raw content
    if (!schema.type && schema.description) {
        return rawContent(args);
    }

    // if there is no type but there is a summaryInfo, this is a summary page.
    if (!schema.type && schema.summaryInfo) {
        return summary(args);
    }

    throw Error(`No default transformer found for type "${schema.type}"`);
};
