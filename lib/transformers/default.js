const govukInput = require('./govukInput');
const govukRadios = require('./govukRadios');
const govukCheckboxes = require('./govukCheckboxes');
const govukDateInput = require('./govukDateInput');
const rawContent = require('./rawContent');
const form = require('./form');
const govukSelect = require('./govukSelect');
const summary = require('./summary');
const govukCharacterCount = require('./govukCharacterCount');

// TODO: Tidy these args up e.g. duplicated in function body
module.exports = ({
    schemaKey,
    schema,
    options,
    transformations,
    transform,
    data,
    schemaErrors,
    fullUiSchema
} = {}) => {
    const args = {
        schemaKey,
        schema,
        options,
        transformations,
        transform,
        data,
        schemaErrors,
        fullUiSchema
    };
    // base default instruction on schema type
    if (schema.type === 'string') {
        if ('maxLength' in schema && schema.maxLength >= 500) {
            return govukCharacterCount(args);
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

    if (schema.type === 'integer') {
        if ('oneOf' in schema) {
            if (schema.oneOf.length < 20) {
                return govukRadios(args);
            }
            return govukSelect(args);
        }
    }

    if (schema.type === 'array') {
        return govukCheckboxes(args);
    }

    if (schema.type === 'object') {
        if ('properties' in schema && 'summaryInfo' in schema.properties) {
            return summary(args);
        }
        return form(args);
    }

    if (schema.type === 'boolean') {
        return govukRadios(args);
    }

    // if there is no type but there is a description, this is raw content
    if (!schema.type && schema.description) {
        return rawContent(args);
    }

    throw Error(`No default transformer found for type "${schema.type}"`);
};
