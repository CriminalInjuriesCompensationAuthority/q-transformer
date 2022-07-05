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

const {
    schemaWithUiSchemaOutputOrder,
    schemaWithUiSchemaOutputOrderContent
} = require('./fixtures/downloadSummary/schema-with-uiSchema-ouptut-order');
const {removeIndentation, escapeSchemaContent} = require('./schema-string-helper');

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

                    describe('And the summaryStructure is a composite name', () => {
                        it('should return a valid govukSummaryList instruction with no change links', () => {
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
                    });

                    describe('And the summaryStructure has a composite name and date component', () => {
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

                    describe('And the summaryStructure output order relies on an external uiSchema', () => {
                        it('should return a govukSummaryList in the order defined by the template and append answers which are supplied in the body but not defined in the template with no change links present', () => {
                            const result = qTransformer.transform(schemaWithUiSchemaOutputOrder);

                            const expected = {
                                componentName: 'summary',
                                content: schemaWithUiSchemaOutputOrderContent,
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
});
