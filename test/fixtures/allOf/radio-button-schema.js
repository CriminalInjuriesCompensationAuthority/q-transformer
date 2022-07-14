module.exports = {
    schemaKey: 'p-radio-button',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        required: ['q-radio-button'],
        additionalProperties: false,
        properties: {
            'q-radio-button': {
                title: 'This is a radio button test',
                type: 'boolean',
                oneOf: [{title: 'Yes', const: true}, {title: 'No', const: false}]
            }
        },
        errorMessage: {
            required: {
                'q-radio-button': 'Select yes'
            }
        }
    },
    uiSchema: {}
};
