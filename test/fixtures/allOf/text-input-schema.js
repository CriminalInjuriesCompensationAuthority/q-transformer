module.exports = {
    schemaKey: 'p-input-text',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        required: ['q-input-type-text'],
        properties: {
            'q-input-type-textn': {
                type: 'string',
                title: 'Enter input text',
                description: 'You can provide any input text.',
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
    uiSchema: {}
};
