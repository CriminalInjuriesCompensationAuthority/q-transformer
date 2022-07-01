const schemaComposite = {
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
};

const schemaCompositeContent =
    '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n}\n}\n]\n}) }}';

module.exports = {schemaComposite, schemaCompositeContent};
