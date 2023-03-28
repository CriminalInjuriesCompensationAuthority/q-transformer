module.exports = {
    schemaKey: 'p-applicant-enter-your-name',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        title: 'Page Title',
        allOf: [
            {
                required: ['q-applicant-has-crime-reference-number'],
                // additionalProperties: true,
                properties: {
                    'q-applicant-has-crime-reference-number': {
                        type: 'boolean',
                        title: 'Do you have a crime reference number?',
                        description:
                            'This is the number the police gave the crime when it was reported. We need this to get information about the crime from them. You will need to add this later in the application.',
                        oneOf: [
                            {
                                title: 'Yes',
                                const: true,
                                description: 'You can provide any text.'
                            },
                            {
                                title: 'No',
                                const: false,
                                description: 'You can provide any text.'
                            }
                        ],
                        meta: {
                            classifications: {
                                theme: 'crime'
                            }
                        }
                    }
                },
                errorMessage: {
                    required: {
                        'q-applicant-has-crime-reference-number':
                            'Select yes if you know the crime reference number'
                    }
                }
            },
            {
                // additionalProperties: true,
                properties: {
                    'crn-info': {
                        description:
                            '{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "I do not know the crime reference number",html: \'<p class="govuk-body">If you do not have your crime reference number, call 101 to speak to your local police station. They can help you get this.</p>\'})}}'
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
    }
};
