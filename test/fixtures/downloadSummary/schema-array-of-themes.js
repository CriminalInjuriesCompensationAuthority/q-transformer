const schemaArrayOfThemes = {
    type: 'object',
    $schema: 'http://json-schema.org/draft-07/schema#',
    downloadSummary: true,
    properties: {
        'p-check-your-answers': {
            type: 'object',
            title: 'Check your answers',
            description: 'Check your answers before sending your application',
            properties: {
                summaryInfo: {
                    type: 'object',
                    lookup: {},
                    urlPath: 'apply',
                    editAnswerText: 'Change',
                    summaryStructure: [
                        {
                            type: 'theme',
                            id: 'about-application',
                            title: 'About your application',
                            values: [
                                {
                                    id: 'q--new-or-existing-application',
                                    type: 'simple',
                                    label: 'What would you like to do?',
                                    value: 'new',
                                    valueLabel: 'Start a new application',
                                    sectionId: 'p--new-or-existing-application',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q-applicant-fatal-claim',
                                    type: 'simple',
                                    label: 'Are you applying because someone died?',
                                    value: false,
                                    valueLabel: 'No',
                                    sectionId: 'p-applicant-fatal-claim',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q--was-the-crime-reported-to-police',
                                    type: 'simple',
                                    label: 'Was the crime reported to the police?',
                                    value: true,
                                    valueLabel: 'Yes',
                                    sectionId: 'p--was-the-crime-reported-to-police',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q-applicant-has-crime-reference-number',
                                    type: 'simple',
                                    label: 'Do you have a crime reference number?',
                                    value: true,
                                    valueLabel: 'Yes',
                                    sectionId: 'p-applicant-has-crime-reference-number',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q-applicant-who-are-you-applying-for',
                                    type: 'simple',
                                    label: 'Who are you applying for?',
                                    value: 'myself',
                                    valueLabel: 'Myself',
                                    sectionId: 'p-applicant-who-are-you-applying-for',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q-applicant-are-you-18-or-over',
                                    type: 'simple',
                                    label: 'Are you 18 or over?',
                                    value: true,
                                    valueLabel: 'Yes',
                                    sectionId: 'p-applicant-are-you-18-or-over',
                                    theme: 'about-application'
                                },
                                {
                                    id: 'q-applicant-british-citizen-or-eu-national',
                                    type: 'simple',
                                    label: 'Are you a British citizen or EU national?',
                                    value: true,
                                    valueLabel: 'Yes',
                                    sectionId: 'p-applicant-british-citizen-or-eu-national',
                                    theme: 'about-application'
                                }
                            ]
                        }
                    ]
                }
            }
        }
    },
    additionalProperties: false
};

const schemaArrayOfThemesContent =
    '\n            {% from "summary-list/macro.njk" import govukSummaryList %}\n            \n            <h1 class="govuk-heading-l">Check your answers before sending your application</h1>\n<h2 class="govuk-heading-l">About your application</h2>\n\n                      {{ govukSummaryList({\n                        classes: \'govuk-!-margin-bottom-9\',\n                        rows: [\n    {\n        "key": {\n            "text": "What would you like to do?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Start a new application"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you applying because someone died?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "No"\n        }\n    },\n    {\n        "key": {\n            "text": "Was the crime reported to the police?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Do you have a crime reference number?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Who are you applying for?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Myself"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you 18 or over?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you a British citizen or EU national?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    }\n]\n                      }) }}';

module.exports = {schemaArrayOfThemes, schemaArrayOfThemesContent};
