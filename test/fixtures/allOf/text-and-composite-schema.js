module.exports = {
    schemaKey: 'p-applicant-enter-your-name',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        title: 'Page Title',
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
                required: ['q-applicant-title', 'q-applicant-last-name'],
                title: 'Enter your name',
                allOf: [
                    {
                        properties: {
                            'q-applicant-title': {
                                title: 'Title',
                                type: 'string',
                                maxLength: 6,
                                errorMessage: {
                                    maxLength: 'Title must be 6 characters or less'
                                }
                            }
                        }
                    },
                    {
                        properties: {
                            'q-applicant-last-name': {
                                title: 'Last name',
                                type: 'string',
                                maxLength: 70,
                                errorMessage: {
                                    maxLength: 'Last name must be 70 characters or less'
                                }
                            }
                        }
                    }
                ],
                errorMessage: {
                    required: {
                        'q-applicant-title': 'Enter your title',
                        'q-applicant-last-name': 'Enter your last name'
                    }
                }
            }
        ]
    },
    uiSchema: {}
};
