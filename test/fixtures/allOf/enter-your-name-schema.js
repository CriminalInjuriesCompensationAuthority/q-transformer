module.exports = {
    schemaKey: 'p-applicant-enter-your-name',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        allOf: [
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
