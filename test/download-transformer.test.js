const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');
const govukSelectTransformer = require('../lib/transformers/govukSelect');

// Remove indentation from strings when comparing them
function removeIndentation(val) {
    const regex = /^\s+/gm;

    if (val && typeof val === 'object' && !Array.isArray(val)) {
        return JSON.parse(
            JSON.stringify(val, (key, value) => {
                if (typeof value === 'string') {
                    return value.replace(regex, '');
                }

                return value;
            })
        );
    }

    return val.replace(regex, '');
}

function escapeSchemaContent(schema) {
    // Double escape any "\\" to work around this issue: https://github.com/mozilla/nunjucks/issues/625
    const schemaAsJson = JSON.stringify(schema);
    const schemaWithEscapedContent = JSON.parse(schemaAsJson.replace(/\\\\/g, '\\\\\\\\'));

    return schemaWithEscapedContent;
}

const schema = {
    type: 'object',
    $schema: 'http://json-schema.org/draft-07/schema#',
    downloadSummary: true,
    properties: {
        'p-check-your-answers': {
            type: 'object',
            title: 'Check your answers',
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
describe('qTransformer', () => {
    let qTransformer;

    beforeEach(() => {
        qTransformer = createQTransformer({
            default: defaultTransformer,
            govukSelect: govukSelectTransformer
        });
    });

    describe('Defaults', () => {
        describe('Given a JSON Schema with type:object', () => {
            describe('And the summaryStructure key is present in summaryInfo', () => {
                describe('And the summaryStructure key is present in summaryInfo', () => {
                    describe('And the summaryStructure is an array of themes', () => {
                        it('should return govukSummaryList instruction without the actions change links', () => {
                            const result = qTransformer.transform({
                                schemaKey: 'p--check-your-answers',
                                schema: escapeSchemaContent(schema),
                                uiSchema: {
                                    'p--check-your-answers': {
                                        options: {
                                            pageContext: 'summary'
                                        }
                                    }
                                }
                            });

                            const expected = {
                                hasErrors: false,
                                content:
                                    '\n            {% from "summary-list/macro.njk" import govukSummaryList %}\n            \n            <h2 class="govuk-heading-l">About your application</h2>\n                  {{ govukSummaryList({\n                    classes: \'govuk-!-margin-bottom-9\',\n                    rows: [\n    {\n        "key": {\n            "text": "What would you like to do?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Start a new application"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you applying because someone died?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "No"\n        }\n    },\n    {\n        "key": {\n            "text": "Was the crime reported to the police?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Do you have a crime reference number?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Who are you applying for?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Myself"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you 18 or over?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    },\n    {\n        "key": {\n            "text": "Are you a British citizen or EU national?",\n            "classes": "govuk-!-width-one-half"\n        },\n        "value": {\n            "html": "Yes"\n        }\n    }\n]\n                  }) }}',
                                pageTitle: 'Check your answers'
                            };

                            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                        });

                        it('should return a govukSummaryList instruction', () => {
                            const result = qTransformer.transform({
                                schemaKey: 'p--check-your-answers',
                                schema: {
                                    type: 'object',
                                    downloadSummary: true,
                                    properties: {
                                        summaryInfo: {
                                            urlPath: 'apply',
                                            editAnswerText: 'Change',
                                            summaryStructure: [
                                                {
                                                    type: 'theme',
                                                    id: 'applicant_details',
                                                    title: 'Your details',
                                                    values: [
                                                        {
                                                            type: 'composite',
                                                            id: 'applicant-name',
                                                            label: 'Enter your name',
                                                            themeId: 'applicant_details',
                                                            values: [
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-title',
                                                                    label: 'Title',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Mr'
                                                                },
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-first-name',
                                                                    label: 'First name',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Foo'
                                                                },
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-last-name',
                                                                    label: 'Last name',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Bar'
                                                                }
                                                            ],
                                                            sectionId: 'p-applicant-enter-your-name'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            });

                            const expected = {
                                componentName: 'summary',
                                content:
                                    '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n}\n}\n]\n}) }}',
                                dependencies: [
                                    '{% from "summary-list/macro.njk" import govukSummaryList %}'
                                ],
                                id: 'p--check-your-answers'
                            };

                            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                        });

                        it('should return a govukSummaryList instructions under the correct headings', () => {
                            const result = qTransformer.transform({
                                schemaKey: 'p--check-your-answers',
                                schema: {
                                    type: 'object',
                                    downloadSummary: true,
                                    properties: {
                                        summaryInfo: {
                                            urlPath: 'apply',
                                            editAnswerText: 'Change',
                                            summaryStructure: [
                                                {
                                                    type: 'theme',
                                                    id: 'applicant_details',
                                                    title: 'Your details',
                                                    values: [
                                                        {
                                                            type: 'composite',
                                                            id: 'applicant-name',
                                                            label: 'Enter your name',
                                                            themeId: 'applicant_details',
                                                            values: [
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-title',
                                                                    label: 'Title',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Mr'
                                                                },
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-first-name',
                                                                    label: 'First name',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Foo'
                                                                },
                                                                {
                                                                    type: 'simple',
                                                                    id: 'q-applicant-last-name',
                                                                    label: 'Last name',
                                                                    closedQuestion: false,
                                                                    themeId: 'applicant_details',
                                                                    value: 'Bar'
                                                                }
                                                            ],
                                                            sectionId: 'p-applicant-enter-your-name'
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: 'theme',
                                                    id: 'crime_details',
                                                    title: 'About the crime',
                                                    values: [
                                                        {
                                                            type: 'simple',
                                                            id:
                                                                'q-applicant-when-did-the-crime-happen',
                                                            label: 'When did the crime happen?',
                                                            closedQuestion: false,
                                                            themeId: 'crime_details',
                                                            value: '2019-01-01T00:00:00.000Z',
                                                            sectionId:
                                                                'p-applicant-when-did-the-crime-happen',
                                                            format: {
                                                                value: 'date-time',
                                                                precision: 'YYYY-MM-DD',
                                                                defaults: {
                                                                    DD: '01'
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            });

                            const expected = {
                                componentName: 'summary',
                                content:
                                    '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n}\n}\n]\n}) }}',
                                dependencies: [
                                    '{% from "summary-list/macro.njk" import govukSummaryList %}'
                                ],
                                id: 'p--check-your-answers'
                            };

                            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                        });
                    });

                    it('should return a govukSummaryList in the order defined by the template and append answers which are supplied in the body but not defined in the template', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'p-summary',
                            downloadSummary: true,
                            schema: {
                                type: 'object',
                                properties: {
                                    summaryInfo: {
                                        urlPath: 'apply',
                                        editAnswerText: 'Change',
                                        summaryStructure: [
                                            {
                                                title: 'Your details',
                                                questions: [{id: 'p-some-section', label: 'Name'}]
                                            }
                                        ],
                                        lookup: {
                                            true: 'Yes',
                                            false: 'No'
                                        }
                                    }
                                }
                            },
                            uiSchema: {},

                            data: {
                                'p-some-section': {
                                    'q-3': 'McTest',
                                    'q-2': 'Test',
                                    'q-1': 'Mr',
                                    'q-5': 'blah',
                                    'q-4': 'foo'
                                }
                            },
                            fullUiSchema: {
                                'p--some-page': {
                                    options: {
                                        isSummary: true,
                                        buttonText: 'Agree and Submit',
                                        properties: {
                                            'p-summary': {
                                                options: {
                                                    summaryStructure: [
                                                        {
                                                            title: 'Your details',
                                                            questions: {'p-some-section': 'Name'}
                                                        }
                                                    ],
                                                    lookup: {
                                                        true: 'Yes',
                                                        false: 'No'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                'p-some-section': {
                                    options: {
                                        outputOrder: ['q-1', 'q-2', 'q-3']
                                    }
                                }
                            }
                        });

                        const expected = {
                            componentName: 'summary',
                            content:
                                '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr<br>Test<br>McTest<br>blah<br>foo"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/some-section?next=summary",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}',
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p-summary'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });
                });
            });
        });
    });
});
