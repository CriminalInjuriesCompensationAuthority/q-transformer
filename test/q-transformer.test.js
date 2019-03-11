const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');

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

describe('qTransformer', () => {
    let qTransformer;

    beforeEach(() => {
        qTransformer = createQTransformer({
            default: defaultTransformer
        });
    });

    describe('Defaults', () => {
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
                    id: 'declaration',
                    dependencies: ['{% from "warning-text/macro.njk" import govukWarningText %}'],
                    componentName: 'rawContent',
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
                    id: 'event-name',
                    dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                    componentName: 'govukInput',
                    macroOptions: {
                        label: {
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

            describe('And a maxLength >= 500', () => {
                it('should convert it to a govukTextarea instruction', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'more-detail',
                        schema: {
                            type: 'string',
                            maxLength: 500,
                            title: 'Can you provide more detail?',
                            description:
                                'Do not include personal or financial information, like your National Insurance number or credit card details.'
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        id: 'more-detail',
                        dependencies: ['{% from "textarea/macro.njk" import govukTextarea %}'],
                        componentName: 'govukTextarea',
                        macroOptions: {
                            name: 'more-detail',
                            id: 'more-detail',
                            label: {
                                text: 'Can you provide more detail?'
                            },
                            hint: {
                                text:
                                    'Do not include personal or financial information, like your National Insurance number or credit card details.'
                            }
                        }
                    };

                    expect(result).toEqual(expected);
                });
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
                        id: 'where-do-you-live',
                        dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
                        componentName: 'govukRadios',
                        macroOptions: {
                            idPrefix: 'where-do-you-live',
                            name: 'where-do-you-live',
                            fieldset: {
                                legend: {
                                    text: 'Where do you live?'
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

            describe('And a format attribute = "date"', () => {
                it('should convert it to a govukDateInput instruction', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'passport-issued',
                        schema: {
                            type: 'string',
                            format: 'date-time', // https://www.iso.org/iso-8601-date-and-time-format.html
                            title: 'When was your passport issued?',
                            description: 'For example, 12 11 2007'
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        id: 'passport-issued',
                        dependencies: ['{% from "date-input/macro.njk" import govukDateInput %}'],
                        componentName: 'govukDateInput',
                        macroOptions: {
                            id: 'passport-issued',
                            fieldset: {
                                legend: {
                                    text: 'When was your passport issued?'
                                }
                            },
                            hint: {
                                text: 'For example, 12 11 2007'
                            },
                            items: [
                                {
                                    label: 'Day',
                                    classes: 'govuk-input--width-2',
                                    name: 'passport-issued[day]'
                                },
                                {
                                    label: 'Month',
                                    classes: 'govuk-input--width-2',
                                    name: 'passport-issued[month]'
                                },
                                {
                                    label: 'Year',
                                    classes: 'govuk-input--width-4',
                                    name: 'passport-issued[year]'
                                }
                            ]
                        }
                    };

                    expect(result).toEqual(expected);
                });
            });
        });

        describe('Given a JSON Schema with type:array', () => {
            it('should convert it to a govukCheckboxes instruction', () => {
                const result = qTransformer.transform({
                    schemaKey: 'waste',
                    schema: {
                        title: 'Which types of waste do you transport?',
                        description: 'Select all that apply.',
                        type: 'array',
                        items: {
                            anyOf: [
                                {
                                    title: 'Waste from animal carcasses',
                                    const: 'carcasses'
                                },
                                {
                                    title: 'Waste from mines or quarries',
                                    const: 'mines'
                                },
                                {
                                    title: 'Farm or agricultural waste',
                                    const: 'farm'
                                }
                            ]
                        }
                    },
                    uiSchema: {}
                });

                const expected = {
                    id: 'waste',
                    dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                    componentName: 'govukCheckboxes',
                    macroOptions: {
                        name: 'waste[]',
                        fieldset: {
                            legend: {
                                text: 'Which types of waste do you transport?'
                            }
                        },
                        hint: {
                            text: 'Select all that apply.'
                        },
                        items: [
                            {
                                value: 'carcasses',
                                text: 'Waste from animal carcasses'
                            },
                            {
                                value: 'mines',
                                text: 'Waste from mines or quarries'
                            },
                            {
                                value: 'farm',
                                text: 'Farm or agricultural waste'
                            }
                        ]
                    }
                };

                expect(result).toEqual(expected);
            });
        });

        describe('Given a JSON Schema with type:object', () => {
            it('should render a nunjucks representation of a form', () => {
                const result = qTransformer.transform({
                    schemaKey: 'event-name',
                    schema: {
                        type: 'object',
                        propertyNames: {
                            enum: ['email', 'phone', 'text']
                        },
                        properties: {
                            email: {
                                type: 'string',
                                description: 'e.g. something@something.com',
                                format: 'email',
                                title: 'Email address'
                            },
                            instructions: {
                                description: `
                                    <p>Some instructions</p>
                                    {{ govukWarningText({
                                        text: "Follow these exactly as described"
                                    }) }}
                                    <ol>
                                        <li>Instruction 1</li>
                                        <li>Instruction 2</li>
                                    </ol>
                                    {{ govukDetails({
                                        summaryText: "Help",
                                        text: "Follow the instructions"
                                    }) }}
                                `
                            },
                            phone: {type: 'string', title: 'Phone number'},
                            text: {type: 'string', title: 'Mobile phone number'},
                            declaration: {
                                description: `
                                    <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                                    {{ govukWarningText({
                                        text: "You could be prosecuted or get less compensation if you give false or misleading information."
                                    }) }}
                                `
                            }
                        }
                    },
                    uiSchema: {}
                });

                const expected = `
                    <form method="post">
                        {% from "button/macro.njk" import govukButton %}
                        {% from "input/macro.njk" import govukInput %}
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        {% from "details/macro.njk" import govukDetails %}
                        {{ govukInput({
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
                            }
                        }) }}
                        <p>Some instructions</p>
                        {{ govukWarningText({
                            text: "Follow these exactly as described"
                        }) }}
                        <ol>
                            <li>Instruction 1</li>
                            <li>Instruction 2</li>
                        </ol>
                        {{ govukDetails({
                            summaryText: "Help",
                            text: "Follow the instructions"
                        }) }}
                        {{ govukInput({
                            "id": "phone",
                            "name": "phone",
                            "type": "text",
                            "label": {
                                "text": "Phone number"
                            },
                            "hint": null
                        }) }}
                        {{ govukInput({
                            "id": "text",
                            "name": "text",
                            "type": "text",
                            "label": {
                                "text": "Mobile phone number"
                            },
                            "hint": null
                        }) }}
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}
                        {{ govukButton({
                            text: "Continue"
                        }) }}
                    </form>`;

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });

            it('should render a nunjucks representation of a form including an h1 if schema.title is present', () => {
                const result = qTransformer.transform({
                    schemaKey: 'event-name',
                    schema: {
                        type: 'object',
                        title: 'Event name',
                        propertyNames: {
                            enum: ['email']
                        },
                        properties: {
                            email: {
                                type: 'string',
                                description: 'e.g. something@something.com',
                                format: 'email',
                                title: 'Email address'
                            },
                            declaration: {
                                description: `
                                    <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                                    {{ govukWarningText({
                                        text: "You could be prosecuted or get less compensation if you give false or misleading information."
                                    }) }}
                                `
                            }
                        }
                    },
                    uiSchema: {}
                });

                const expected = `
                    <form method="post">
                        {% from "button/macro.njk" import govukButton %}
                        {% from "input/macro.njk" import govukInput %}
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        <h1 class="govuk-heading-xl">Event name</h1>
                        {{ govukInput({
                            "id": "email",
                            "name": "email",
                            "type": "email",
                            "label": {
                                "text": "Email address"
                            },
                            "hint": {
                                "text": "e.g. something@something.com"
                            }
                        }) }}
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}
                        {{ govukButton({
                            text: "Continue"
                        }) }}
                    </form>`;

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });
        });

        describe('Given a JSON Schema with type:boolean', () => {
            it('should convert it to a govukRadios instruction', () => {
                const result = qTransformer.transform({
                    schemaKey: 'changed-name',
                    schema: {
                        type: 'boolean',
                        title: 'Have you changed your name?',
                        description:
                            'This includes changing your last name or spelling your name differently.'
                    },
                    uiSchema: {}
                });

                const expected = {
                    id: 'changed-name',
                    dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
                    componentName: 'govukRadios',
                    macroOptions: {
                        classes: 'govuk-radios--inline',
                        idPrefix: 'changed-name',
                        name: 'changed-name',
                        fieldset: {
                            legend: {
                                text: 'Have you changed your name?'
                            }
                        },
                        hint: {
                            text:
                                'This includes changing your last name or spelling your name differently.'
                        },
                        items: [
                            {
                                value: true,
                                text: 'Yes'
                            },
                            {
                                value: false,
                                text: 'No'
                            }
                        ]
                    }
                };

                expect(result).toEqual(expected);
            });
        });
    });

    describe('Conditional content', () => {
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
                                // transformer: 'form',
                                options: {
                                    transformOrder: ['email', 'phone', 'text', 'contact'],
                                    outputOrder: ['contact'],
                                    properties: {
                                        contact: {
                                            // transformer: 'govukRadios',
                                            options: {
                                                conditionalComponentMap: [
                                                    {
                                                        itemValue: 'email',
                                                        componentIds: ['email']
                                                    },
                                                    {
                                                        itemValue: 'phone',
                                                        componentIds: ['phone']
                                                    },
                                                    {
                                                        itemValue: 'text',
                                                        componentIds: ['text']
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                    const expected = `
                        <form method="post">
                            {% from "button/macro.njk" import govukButton %}
                            {% from "input/macro.njk" import govukInput %}
                            {% from "radios/macro.njk" import govukRadios %}
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
                                            "html": ([
                                                govukInput({
                                                    "id": "email",
                                                    "name": "email",
                                                    "type": "email",
                                                    "label": {
                                                        "text": "Email address"
                                                    },
                                                    "hint": {
                                                        "text": "e.g. something@something.com"
                                                    },
                                                    "classes": "govuk-!-width-one-third"
                                                })
                                            ] | join())
                                        }
                                    },
                                    {
                                        "value": "phone",
                                        "text": "Phone",
                                        "conditional": {
                                            "html": ([
                                                govukInput({
                                                    "id": "phone",
                                                    "name": "phone",
                                                    "type": "text",
                                                    "label": {
                                                        "text": "Phone number"
                                                    },
                                                    "hint": null,
                                                    "classes": "govuk-!-width-one-third"
                                                })
                                            ] | join())
                                        }
                                    },
                                    {
                                        "value": "text",
                                        "text": "Text message",
                                        "conditional": {
                                            "html": ([
                                                govukInput({
                                                    "id": "text",
                                                    "name": "text",
                                                    "type": "text",
                                                    "label": {
                                                        "text": "Mobile phone number"
                                                    },
                                                    "hint": null,
                                                    "classes": "govuk-!-width-one-third"
                                                })
                                            ] | join())
                                        }
                                    }
                                ]
                            }) }}
                            {{ govukButton({
                                text: "Continue"
                            }) }}
                        </form>`;

                    expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                });

                it('should convert it to a govukRadios with multiple conditional content', () => {
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
                                // transformer: 'form',
                                options: {
                                    transformOrder: ['email', 'phone', 'text', 'contact'],
                                    outputOrder: ['contact'],
                                    properties: {
                                        contact: {
                                            // transformer: 'govukRadios',
                                            options: {
                                                conditionalComponentMap: [
                                                    {
                                                        itemValue: 'email',
                                                        componentIds: ['email', 'phone', 'text']
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                    const expected = `
                        <form method="post">
                            {% from "button/macro.njk" import govukButton %}
                            {% from "input/macro.njk" import govukInput %}
                            {% from "radios/macro.njk" import govukRadios %}
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
                                            "html": ([
                                                govukInput({
                                                    "id": "email",
                                                    "name": "email",
                                                    "type": "email",
                                                    "label": {
                                                        "text": "Email address"
                                                    },
                                                    "hint": {
                                                        "text": "e.g. something@something.com"
                                                    },
                                                    "classes": "govuk-!-width-one-third"
                                                }),
                                                govukInput({
                                                    "id": "phone",
                                                    "name": "phone",
                                                    "type": "text",
                                                    "label": {
                                                        "text": "Phone number"
                                                    },
                                                    "hint": null,
                                                    "classes": "govuk-!-width-one-third"
                                                }),
                                                govukInput({
                                                    "id": "text",
                                                    "name": "text",
                                                    "type": "text",
                                                    "label": {
                                                        "text": "Mobile phone number"
                                                    },
                                                    "hint": null,
                                                    "classes": "govuk-!-width-one-third"
                                                })
                                            ] | join())
                                        }
                                    },
                                    {
                                        "value": "phone",
                                        "text": "Phone"
                                    },
                                    {
                                        "value": "text",
                                        "text": "Text message"
                                    }
                                ]
                            }) }}
                            {{ govukButton({
                                text: "Continue"
                            }) }}
                        </form>`;

                    expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                });
            });
        });
    });

    describe('Pre-populate input values with supplied data', () => {
        it('should pre-populate instructions called from Form', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'object',
                    propertyNames: {
                        enum: ['email']
                    },
                    properties: {
                        email: {
                            type: 'string',
                            description: 'e.g. something@something.com',
                            format: 'email',
                            title: 'Email address'
                        }
                    }
                },
                uiSchema: {},
                data: {
                    email: 'peppa@peppapig.com'
                }
            });

            const expected = `
                <form method="post">
                    {% from "button/macro.njk" import govukButton %}
                    {% from "input/macro.njk" import govukInput %}
                    {{ govukInput({
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
                        "value": "peppa@peppapig.com"
                    }) }}
                    {{ govukButton({
                        text: "Continue"
                    }) }}
                </form>`;

            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
        });

        it('should pre-populate a govukInput instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material."
                },
                uiSchema: {},
                data: {
                    'event-name': 'Peppa Pig'
                }
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        text: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    value: 'Peppa Pig'
                }
            };

            expect(result).toEqual(expected);
        });

        it('should pre-populate a govukRadios instruction', () => {
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
                uiSchema: {},
                data: {
                    'where-do-you-live': 'scotland'
                }
            });

            const expected = {
                id: 'where-do-you-live',
                dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
                componentName: 'govukRadios',
                macroOptions: {
                    idPrefix: 'where-do-you-live',
                    name: 'where-do-you-live',
                    fieldset: {
                        legend: {
                            text: 'Where do you live?'
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
                            text: 'Scotland',
                            checked: true
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

        it('should pre-populate a govukCheckboxes instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'waste',
                schema: {
                    title: 'Which types of waste do you transport?',
                    description: 'Select all that apply.',
                    type: 'array',
                    items: {
                        anyOf: [
                            {
                                title: 'Waste from animal carcasses',
                                const: 'carcasses'
                            },
                            {
                                title: 'Waste from mines or quarries',
                                const: 'mines'
                            },
                            {
                                title: 'Farm or agricultural waste',
                                const: 'farm'
                            }
                        ]
                    }
                },
                uiSchema: {},
                data: {
                    'waste[]': ['mines', 'farm']
                }
            });

            const expected = {
                id: 'waste',
                dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                componentName: 'govukCheckboxes',
                macroOptions: {
                    name: 'waste[]',
                    fieldset: {
                        legend: {
                            text: 'Which types of waste do you transport?'
                        }
                    },
                    hint: {
                        text: 'Select all that apply.'
                    },
                    items: [
                        {
                            value: 'carcasses',
                            text: 'Waste from animal carcasses'
                        },
                        {
                            value: 'mines',
                            text: 'Waste from mines or quarries',
                            checked: true
                        },
                        {
                            value: 'farm',
                            text: 'Farm or agricultural waste',
                            checked: true
                        }
                    ]
                }
            };

            expect(result).toEqual(expected);
        });

        it('should pre-populate a govukTextarea instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'more-detail',
                schema: {
                    type: 'string',
                    maxLength: 500,
                    title: 'Can you provide more detail?',
                    description:
                        'Do not include personal or financial information, like your National Insurance number or credit card details.'
                },
                uiSchema: {},
                data: {
                    'more-detail': 'Peppa Pig'
                }
            });

            const expected = {
                id: 'more-detail',
                dependencies: ['{% from "textarea/macro.njk" import govukTextarea %}'],
                componentName: 'govukTextarea',
                macroOptions: {
                    name: 'more-detail',
                    id: 'more-detail',
                    label: {
                        text: 'Can you provide more detail?'
                    },
                    hint: {
                        text:
                            'Do not include personal or financial information, like your National Insurance number or credit card details.'
                    },
                    value: 'Peppa Pig'
                }
            };

            expect(result).toEqual(expected);
        });

        it('should pre-populate a govukDateInput instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'passport-issued',
                schema: {
                    type: 'string',
                    format: 'date-time', // https://www.iso.org/iso-8601-date-and-time-format.html
                    title: 'When was your passport issued?',
                    description: 'For example, 12 11 2007'
                },
                uiSchema: {},
                data: {
                    'passport-issued': '1980-02-01T00:00:00.000Z'
                }
            });

            const expected = {
                id: 'passport-issued',
                dependencies: ['{% from "date-input/macro.njk" import govukDateInput %}'],
                componentName: 'govukDateInput',
                macroOptions: {
                    id: 'passport-issued',
                    fieldset: {
                        legend: {
                            text: 'When was your passport issued?'
                        }
                    },
                    hint: {
                        text: 'For example, 12 11 2007'
                    },
                    items: [
                        {
                            label: 'Day',
                            classes: 'govuk-input--width-2',
                            name: 'passport-issued[day]',
                            value: 1
                        },
                        {
                            label: 'Month',
                            classes: 'govuk-input--width-2',
                            name: 'passport-issued[month]',
                            value: 2
                        },
                        {
                            label: 'Year',
                            classes: 'govuk-input--width-4',
                            name: 'passport-issued[year]',
                            value: 1980
                        }
                    ]
                }
            };

            expect(result).toEqual(expected);
        });
    });

    describe('Display schema errors', () => {
        it('should display errors for govukInput instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material."
                },
                uiSchema: {},
                data: {
                    'event-name': 1 // this should cause an error as it's not a string
                },
                schemaErrors: {
                    'event-name': 'Wrong type'
                }
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        text: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    value: 1,
                    errorMessage: {
                        text: 'Wrong type'
                    }
                }
            };

            expect(result).toEqual(expected);
        });

        it('should display errors for govukDateInput instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    format: 'date-time',
                    title: 'Event name',
                    description: "The name you'll use on promotional material."
                },
                uiSchema: {},
                data: {
                    'event-name': '0000-00-00T00:00:00.000Z' // this should cause an error as it's not a valid date
                },
                schemaErrors: {
                    'event-name': 'Not a valid date'
                }
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "date-input/macro.njk" import govukDateInput %}'],
                componentName: 'govukDateInput',
                macroOptions: {
                    id: 'event-name',
                    fieldset: {
                        legend: {
                            text: 'Event name'
                        }
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    errorMessage: {
                        text: 'Not a valid date'
                    },
                    items: [
                        {
                            label: 'Day',
                            classes: 'govuk-input--width-2 govuk-input--error',
                            name: 'event-name[day]',
                            value: 0
                        },
                        {
                            label: 'Month',
                            classes: 'govuk-input--width-2 govuk-input--error',
                            name: 'event-name[month]',
                            value: 0
                        },
                        {
                            label: 'Year',
                            classes: 'govuk-input--width-4 govuk-input--error',
                            name: 'event-name[year]',
                            value: 0
                        }
                    ]
                }
            };
            expect(result).toEqual(expected);
        });

        it('should display errors for govukCheckboxes instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'waste',
                schema: {
                    title: 'Which types of waste do you transport?',
                    description: 'Select all that apply.',
                    type: 'array',
                    items: {
                        anyOf: [
                            {
                                title: 'Waste from animal carcasses',
                                const: 'carcasses'
                            },
                            {
                                title: 'Waste from mines or quarries',
                                const: 'mines'
                            },
                            {
                                title: 'Farm or agricultural waste',
                                const: 'farm'
                            }
                        ]
                    }
                },
                uiSchema: {},
                data: {
                    waste: ["something that doesn't match any of the items", 'farm'] // this should cause an error
                },
                schemaErrors: {
                    waste: 'Please select an option'
                }
            });

            const expected = {
                id: 'waste',
                dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                componentName: 'govukCheckboxes',
                macroOptions: {
                    idPrefix: 'waste',
                    name: 'waste',
                    fieldset: {
                        legend: {
                            text: 'Which types of waste do you transport?'
                        }
                    },
                    hint: {
                        text: 'Select all that apply.'
                    },
                    errorMessage: {
                        text: 'Please select an option'
                    },
                    items: [
                        {
                            value: 'carcasses',
                            text: 'Waste from animal carcasses'
                        },
                        {
                            value: 'mines',
                            text: 'Waste from mines or quarries'
                        },
                        {
                            value: 'farm',
                            text: 'Farm or agricultural waste',
                            checked: true
                        }
                    ]
                }
            };

            expect(result).toEqual(expected);
        });

        it('should display errors for govukRadios instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'changed-name',
                schema: {
                    type: 'boolean',
                    title: 'Have you changed your name?',
                    description:
                        'This includes changing your last name or spelling your name differently.'
                },
                uiSchema: {},
                data: {
                    'changed-name': '' // this should cause an error
                },
                schemaErrors: {
                    'changed-name': 'Please select Yes if you have changed your name'
                }
            });

            const expected = {
                id: 'changed-name',
                dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
                componentName: 'govukRadios',
                macroOptions: {
                    classes: 'govuk-radios--inline',
                    idPrefix: 'changed-name',
                    name: 'changed-name',
                    fieldset: {
                        legend: {
                            text: 'Have you changed your name?'
                        }
                    },
                    hint: {
                        text:
                            'This includes changing your last name or spelling your name differently.'
                    },
                    errorMessage: {
                        text: 'Please select Yes if you have changed your name'
                    },
                    items: [
                        {
                            value: true,
                            text: 'Yes'
                        },
                        {
                            value: false,
                            text: 'No'
                        }
                    ]
                }
            };

            expect(result).toEqual(expected);
        });

        it('should display errors for govukTextarea instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'more-detail',
                schema: {
                    type: 'string',
                    maxLength: 500,
                    title: 'Can you provide more detail?',
                    description:
                        'Do not include personal or financial information, like your National Insurance number or credit card details.'
                },
                uiSchema: {},
                data: {
                    'more-detail': 123 // this should cause an error as it's not a string
                },
                schemaErrors: {
                    'more-detail': 'Please enter more details'
                }
            });

            const expected = {
                id: 'more-detail',
                dependencies: ['{% from "textarea/macro.njk" import govukTextarea %}'],
                componentName: 'govukTextarea',
                macroOptions: {
                    name: 'more-detail',
                    id: 'more-detail',
                    label: {
                        text: 'Can you provide more detail?'
                    },
                    errorMessage: {
                        text: 'Please enter more details'
                    },
                    hint: {
                        text:
                            'Do not include personal or financial information, like your National Insurance number or credit card details.'
                    },
                    value: 123
                }
            };

            expect(result).toEqual(expected);
        });

        it('should display an error summary above the form', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'object',
                    propertyNames: {
                        enum: ['email', 'phone', 'text']
                    },
                    properties: {
                        email: {
                            type: 'string',
                            description: 'e.g. something@something.com',
                            format: 'email',
                            title: 'Email address'
                        },
                        instructions: {
                            description: `
                                    <p>Some instructions</p>
                                    {{ govukWarningText({
                                        text: "Follow these exactly as described"
                                    }) }}
                                    <ol>
                                        <li>Instruction 1</li>
                                        <li>Instruction 2</li>
                                    </ol>
                                    {{ govukDetails({
                                        summaryText: "Help",
                                        text: "Follow the instructions"
                                    }) }}
                                `
                        },
                        phone: {type: 'string', title: 'Phone number'},
                        text: {type: 'string', title: 'Mobile phone number'},
                        declaration: {
                            description: `
                                    <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                                    {{ govukWarningText({
                                        text: "You could be prosecuted or get less compensation if you give false or misleading information."
                                    }) }}
                                `
                        }
                    }
                },
                uiSchema: {},
                schemaErrors: {
                    'event-one': 'Please enter a value',
                    'event-two': 'This is not a valid type'
                }
            });

            const expected = `
                    {% from "error-summary/macro.njk" import govukErrorSummary %}
                      {{ govukErrorSummary({
                        titleText: "There is a problem",
                        errorList:[{"href":"#event-one","text":"Please enter a value"},{"href":"#event-two","text":"This is not a valid type"}]}) }}
                        <form method="post">
                        {% from "button/macro.njk" import govukButton %}
                        {% from "input/macro.njk" import govukInput %}
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        {% from "details/macro.njk" import govukDetails %}
                        {{ govukInput({
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
                            }
                        }) }}
                        <p>Some instructions</p>
                        {{ govukWarningText({
                            text: "Follow these exactly as described"
                        }) }}
                        <ol>
                            <li>Instruction 1</li>
                            <li>Instruction 2</li>
                        </ol>
                        {{ govukDetails({
                            summaryText: "Help",
                            text: "Follow the instructions"
                        }) }}
                        {{ govukInput({
                            "id": "phone",
                            "name": "phone",
                            "type": "text",
                            "label": {
                                "text": "Phone number"
                            },
                            "hint": null
                        }) }}
                        {{ govukInput({
                            "id": "text",
                            "name": "text",
                            "type": "text",
                            "label": {
                                "text": "Mobile phone number"
                            },
                            "hint": null
                        }) }}
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}
                        {{ govukButton({
                            text: "Continue"
                        }) }}
                    </form>`;

            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
        });
    });
});
