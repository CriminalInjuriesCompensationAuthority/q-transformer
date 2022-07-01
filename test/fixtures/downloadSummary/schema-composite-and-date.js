const schemaCompositeAndDate = {
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
                                id: 'q-applicant-when-did-the-crime-happen',
                                label: 'When did the crime happen?',
                                closedQuestion: false,
                                themeId: 'crime_details',
                                value: '2019-01-01T00:00:00.000Z',
                                sectionId: 'p-applicant-when-did-the-crime-happen',
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
};

const schemaCompositeAndDateContent =
    '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n}\n}\n]\n}) }}';

module.exports = {schemaCompositeAndDate, schemaCompositeAndDateContent};
