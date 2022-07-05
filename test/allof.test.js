const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');

const {removeIndentation} = require('./schema-string-helper');

describe('allOf', () => {
    let qTransformer;

    beforeEach(() => {
        qTransformer = createQTransformer({
            default: defaultTransformer
        });
    });

    describe('Defaults', () => {
        describe('Given a JSON Schema with type:object', () => {
            describe('And the "allOf" keyword is present with no "properties" keyword', () => {
                it('should render a nunjucks representation of a form with a nested allOf', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'p-applicant-enter-your-name',
                        schema: {
                            $schema: 'http://json-schema.org/draft-07/schema#',
                            type: 'object',
                            allOf: [
                                {
                                    required: [
                                        'q-applicant-title',
                                        'q-applicant-first-name',
                                        'q-applicant-last-name'
                                    ],
                                    title: 'Enter your name',
                                    allOf: [
                                        {
                                            properties: {
                                                'q-applicant-title': {
                                                    title: 'Title',
                                                    type: 'string',
                                                    maxLength: 6,
                                                    errorMessage: {
                                                        maxLength:
                                                            'Title must be 6 characters or less'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            properties: {
                                                'q-applicant-first-name': {
                                                    title: 'First name',
                                                    type: 'string',
                                                    maxLength: 70,
                                                    errorMessage: {
                                                        maxLength:
                                                            'First name must be 70 characters or less'
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
                                                        maxLength:
                                                            'Last name must be 70 characters or less'
                                                    }
                                                }
                                            }
                                        }
                                    ],
                                    errorMessage: {
                                        required: {
                                            'q-applicant-title': 'Enter your title',
                                            'q-applicant-first-name': 'Enter your first name',
                                            'q-applicant-last-name': 'Enter your last name'
                                        }
                                    }
                                }
                            ]
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        pageTitle: 'Enter your name',
                        hasErrors: false,
                        content: `{% from "input/macro.njk" import govukInput %}
                            {% from "fieldset/macro.njk" import govukFieldset %}
                            {% call govukFieldset({
                                legend: {
                                    html: "Enter your name",
                                    classes: "govuk-fieldset__legend--xl",
                                    isPageHeading: true
                                }
                            }) %}
                                {{ govukInput({
                                    "id": "q-applicant-title",
                                    "name": "q-applicant-title",
                                    "type": "text",
                                    "label": {
                                        "html": "Title"
                                    },
                                    "hint": null,
                                    "classes": "govuk-input--width-10"
                                }) }}
                                {{ govukInput({
                                    "id": "q-applicant-first-name",
                                    "name": "q-applicant-first-name",
                                    "type": "text",
                                    "label": {
                                        "html": "First name"
                                    },
                                    "hint": null,
                                    "classes": "govuk-input--width-30"
                                }) }}
                                {{ govukInput({
                                    "id": "q-applicant-last-name",
                                    "name": "q-applicant-last-name",
                                    "type": "text",
                                    "label": {
                                        "html": "Last name"
                                    },
                                    "hint": null,
                                    "classes": "govuk-input--width-30"
                                }) }}
                            {% endcall %}`
                    };

                    expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                });
            });
        });
    });
});
