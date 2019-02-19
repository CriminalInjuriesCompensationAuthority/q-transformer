const createQTransformer = require('../q-transformer');

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

describe('qTransformer', () => {
    let qTransformer;

    beforeEach(() => {
        qTransformer = createQTransformer();
    });

    describe('Given a JSON schema with only a description', () => {
        it('should return a raw content instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'declaration',
                schema: {
                    description: `
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}
                    `
                },
                uiSchema: {}
            });

            const expected = {
                componentName: 'content',
                content: `
                    <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                    {{ govukWarningText({
                        text: "You could be prosecuted or get less compensation if you give false or misleading information."
                    }) }}
                `
            };

            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
        });
    });

    describe('Given a JSON Schema with type:string', () => {
        it('should convert it to a govukInput instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material."
                },
                uiSchema: {}
            });

            const expected = {
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        classes: 'govuk-label--xl',
                        isPageHeading: true,
                        text: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text'
                }
            };

            expect(result).toEqual(expected);
        });

        describe('And a oneOf attribute', () => {
            it('should convert it to a govukRadios instruction', () => {
                const result = qTransformer.transform({
                    schemaKey: 'where-do-you-live',
                    schema: {
                        title: 'Where do you live?',
                        type: 'string',
                        oneOf: [
                            {
                                const: 'england',
                                title: 'England'
                            },
                            {
                                const: 'scotland',
                                title: 'Scotland'
                            },
                            {
                                const: 'wales',
                                title: 'Wales'
                            },
                            {
                                const: 'northern-ireland',
                                title: 'Northern Ireland'
                            }
                        ]
                    },
                    uiSchema: {}
                });

                const expected = {
                    componentName: 'govukRadios',
                    macroOptions: {
                        idPrefix: 'where-do-you-live',
                        name: 'where-do-you-live',
                        fieldset: {
                            legend: {
                                text: 'Where do you live?',
                                isPageHeading: true,
                                classes: 'govuk-fieldset__legend--xl'
                            }
                        },
                        hint: null,
                        items: [
                            {
                                value: 'england',
                                text: 'England'
                            },
                            {
                                value: 'scotland',
                                text: 'Scotland'
                            },
                            {
                                value: 'wales',
                                text: 'Wales'
                            },
                            {
                                value: 'northern-ireland',
                                text: 'Northern Ireland'
                            }
                        ]
                    }
                };

                expect(result).toEqual(expected);
            });
        });
    });

    describe('Given a JSON Schema with type:object', () => {
        describe('And a uiSchema with a "conditionalComponents" attribute', () => {
            it('should convert it to a govukRadios with conditional content', () => {
                const result = qTransformer.transform({
                    schemaKey: 'p-some-id',
                    schema: {
                        type: 'object',
                        propertyNames: {
                            enum: ['contact', 'email', 'phone', 'text']
                        },
                        properties: {
                            contact: {
                                title: 'How would you prefer to be contacted?',
                                description: 'Select one option.',
                                type: 'string',
                                oneOf: [
                                    {
                                        title: 'Email',
                                        const: 'email'
                                    },
                                    {
                                        title: 'Phone',
                                        const: 'phone'
                                    },
                                    {
                                        title: 'Text message',
                                        const: 'text'
                                    }
                                ]
                            },
                            email: {
                                type: 'string',
                                description: 'e.g. something@something.com',
                                format: 'email',
                                title: 'Email address'
                            },
                            phone: {type: 'string', title: 'Phone number'},
                            text: {type: 'string', title: 'Mobile phone number'}
                        },
                        required: ['contact'],
                        allOf: [
                            {$ref: '#/definitions/if-email-contact-then-email-is-required'},
                            {$ref: '#/definitions/if-phone-contact-then-phone-is-required'},
                            {$ref: '#/definitions/if-text-contact-then-text-is-required'}
                        ],
                        definitions: {
                            'if-email-contact-then-email-is-required': {
                                if: {
                                    properties: {
                                        contact: {const: 'email'}
                                    }
                                },
                                then: {
                                    required: ['email'],
                                    propertyNames: {enum: ['contact', 'email']}
                                }
                            },
                            'if-phone-contact-then-phone-is-required': {
                                if: {
                                    properties: {
                                        contact: {const: 'phone'}
                                    }
                                },
                                then: {
                                    required: ['phone'],
                                    propertyNames: {enum: ['contact', 'phone']}
                                }
                            },
                            'if-text-contact-then-text-is-required': {
                                if: {
                                    properties: {
                                        contact: {const: 'text'}
                                    }
                                },
                                then: {
                                    required: ['text'],
                                    propertyNames: {enum: ['contact', 'text']}
                                }
                            }
                        }
                    },
                    uiSchema: {
                        'p-some-id': {
                            options: {
                                outputProperties: ['contact'],
                                properties: {
                                    contact: {
                                        options: {
                                            conditionalComponents: ['email', 'phone', 'text']
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                const expected = `
                    {{ govukRadios({
                        "idPrefix": "contact",
                        "name": "contact",
                        "fieldset": {
                            "legend": {
                                "text": "How would you prefer to be contacted?",
                                "isPageHeading": true,
                                "classes": "govuk-fieldset__legend--xl"
                            }
                        },
                        "hint": {
                            "text": "Select one option."
                        },
                        "items": [
                            {
                                "value": "email",
                                "text": "Email",
                                "conditional": {
                                    "html": govukInput({
                                        "id": "email",
                                        "name": "email",
                                        "type": "email",
                                        "label": {
                                            "text": "Email address",
                                            "isPageHeading": true,
                                            "classes": "govuk-label--xl"
                                        },
                                        "hint": {
                                            "text": "e.g. something@something.com"
                                        },
                                        "classes": "govuk-!-width-one-third"
                                    })
                                }
                            },
                            {
                                "value": "phone",
                                "text": "Phone",
                                "conditional": {
                                    "html": govukInput({
                                        "id": "phone",
                                        "name": "phone",
                                        "type": "text",
                                        "label": {
                                            "text": "Phone number",
                                            "isPageHeading": true,
                                            "classes": "govuk-label--xl"
                                        },
                                        "hint": null,
                                        "classes": "govuk-!-width-one-third"
                                    })
                                }
                            },
                            {
                                "value": "text",
                                "text": "Text message",
                                "conditional": {
                                    "html": govukInput({
                                        "id": "text",
                                        "name": "text",
                                        "type": "text",
                                        "label": {
                                            "text": "Mobile phone number",
                                            "isPageHeading": true,
                                            "classes": "govuk-label--xl"
                                        },
                                        "hint": null,
                                        "classes": "govuk-!-width-one-third"
                                    })
                                }
                            }
                        ]
                    }) }}`;

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });
        });
    });
});
