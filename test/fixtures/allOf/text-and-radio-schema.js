module.exports = {
    schemaKey: 'p-applicant-enter-your-name',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        allOf: [
            {
                required: ['q-input-type-text'],
                properties: {
                    'q-input-type-text': {
                        type: 'string',
                        title: 'Enter text',
                        description: 'You can provide any text.',
                        // maxLength: 1000,
                        errorMessage: {
                            maxLength: 'Input text must be 1000 characters or less'
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-input-type-text': 'Describe what input text you want to provide'
                    }
                }
            },
            {
                required: ['q-radio-button'],
                additionalProperties: false,
                properties: {
                    'q-radio-button': {
                        title: 'This is a radio button test',
                        type: 'boolean',
                        oneOf: [
                            {title: 'Yes', const: true},
                            {title: 'No', const: false}
                        ]
                    }
                },
                errorMessage: {
                    required: {
                        'q-radio-button': 'Select yes'
                    }
                }
            }
        ]
    },
    uiSchema: {}
};
