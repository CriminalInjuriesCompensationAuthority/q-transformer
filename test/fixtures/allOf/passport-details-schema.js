module.exports = {
    schemaKey: 'p-applicant-enter-your-name',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        title: 'Passport details',
        allOf: [
            {
                required: ['q-passport-number'],
                properties: {
                    'q-passport-number': {
                        type: 'string',
                        title: 'Passport number',
                        maxLength: 12,
                        description: 'For example, 502135326',
                        errorMessage: {
                            maxLength: 'Passport must be 12 characters or less'
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-passport-number': 'Enter passport number'
                    }
                }
            },
            {
                required: ['q-expiry-date'],
                // additionalProperties: false,
                properties: {
                    'q-expiry-date': {
                        title: 'Expiry date',
                        meta: {
                            keywords: {
                                format: {
                                    precision: 'YYYY-MM-DD'
                                }
                            }
                        },
                        type: 'string',
                        format: 'date-time',
                        description: 'For example, 31 3 1980',
                        errorMessage: {
                            format: 'Enter expiry date and include a day, month and year'
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-expiry-date': 'Enter expiry date include a day, month and year'
                    }
                }
            }
        ]
    }
};
