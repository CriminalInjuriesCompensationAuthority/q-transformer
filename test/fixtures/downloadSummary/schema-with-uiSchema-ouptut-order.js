const schemaWithUiSchemaOutputOrder = {
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
                                    questions: {
                                        'p-some-section': 'Name'
                                    }
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
};

const schemaWithUiSchemaOutputOrderContent =
    '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr<br>Test<br>McTest<br>blah<br>foo"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/some-section?next=summary",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}';

module.exports = {schemaWithUiSchemaOutputOrder, schemaWithUiSchemaOutputOrderContent};
