const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');
const govukSelectTransformer = require('../lib/transformers/govukSelect');

const {
    schemaArrayOfThemes,
    schemaArrayOfThemesContent
} = require('./fixtures/downloadSummary/schema-array-of-themes');

const {
    schemaComposite,
    schemaCompositeContent
} = require('./fixtures/downloadSummary/schema-composite');

const {
    schemaCompositeAndDate,
    schemaCompositeAndDateContent
} = require('./fixtures/downloadSummary/schema-composite-and-date');

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
                describe('And the downloadSummary key is present', () => {
                    describe('And the summaryStructure is an array of themes', () => {
                        it('should return govukSummaryList instruction without the actions change links', () => {
                            const result = qTransformer.transform({
                                schemaKey: 'p--check-your-answers',
                                schema: escapeSchemaContent(schemaArrayOfThemes),
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
                                content: schemaArrayOfThemesContent,
                                pageTitle: 'Check your answers'
                            };

                            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                        });
                    });
                });

                describe('And the summaryStructure key is present in summaryInfo', () => {
                    it('should return a govukSummaryList instruction', () => {
                        const result = qTransformer.transform(schemaComposite);

                        const expected = {
                            componentName: 'summary',
                            content: schemaCompositeContent,
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p--check-your-answers'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });

                    it('should return a govukSummaryList instructions under the correct headings with no change links', () => {
                        const result = qTransformer.transform(schemaCompositeAndDate);

                        const expected = {
                            componentName: 'summary',
                            content: schemaCompositeAndDateContent,
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p--check-your-answers'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });
                });

                it('should return a govukSummaryList in the order defined by the template and append answers which are supplied in the body but not defined in the template with no change links', () => {
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
