const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');
const govukSelectTransformer = require('../lib/transformers/govukSelect');
const answerFormatHelper = require('../lib/helpers/answerHelper');
const policeLookup = require('../lib/helpers/policeLookup');
const answerLookup = require('../lib/helpers/answerLookup');

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
    const uiSchema = {
        'p-applicant-have-you-applied-to-us-before': {
            // transformer: 'form',
            options: {
                transformOrder: [
                    'q-enter-your-previous-reference-number',
                    'q-applicant-have-you-applied-to-us-before'
                ],
                outputOrder: ['q-applicant-have-you-applied-to-us-before'],
                properties: {
                    'q-applicant-have-you-applied-to-us-before': {
                        // transformer: 'govukRadios',
                        options: {
                            conditionalComponentMap: [
                                {
                                    itemValue: true,
                                    componentIds: ['q-enter-your-previous-reference-number']
                                }
                            ]
                        }
                    },
                    'q-enter-your-previous-reference-number': {
                        options: {
                            macroOptions: {
                                classes: 'govuk-input--width-20'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-have-you-applied-for-or-received-any-other-compensation': {
            // transformer: 'form',
            options: {
                transformOrder: [
                    'q-applicant-applied-for-other-compensation-briefly-explain-why-not',
                    'q-applicant-have-you-applied-for-or-received-any-other-compensation'
                ],
                outputOrder: [
                    'q-applicant-have-you-applied-for-or-received-any-other-compensation'
                ],
                properties: {
                    'q-applicant-have-you-applied-for-or-received-any-other-compensation': {
                        // transformer: 'govukRadios',
                        options: {
                            conditionalComponentMap: [
                                {
                                    itemValue: false,
                                    componentIds: [
                                        'q-applicant-applied-for-other-compensation-briefly-explain-why-not'
                                    ]
                                }
                            ]
                        }
                    },
                    'q-applicant-applied-for-other-compensation-briefly-explain-why-not': {
                        options: {
                            macroOptions: {
                                classes: 'govuk-input--width-20'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-other-compensation-details': {
            // transformer: 'form',
            options: {
                transformOrder: [
                    'q-applicant-who-did-you-apply-to',
                    'q-how-much-was-award',
                    'q-when-will-you-find-out',
                    'q-applicant-has-a-decision-been-made'
                ],
                outputOrder: [
                    'q-applicant-who-did-you-apply-to',
                    'q-applicant-has-a-decision-been-made'
                ],
                properties: {
                    'q-applicant-has-a-decision-been-made': {
                        // transformer: 'govukRadios',
                        options: {
                            conditionalComponentMap: [
                                {
                                    itemValue: false,
                                    componentIds: ['q-when-will-you-find-out']
                                },
                                {
                                    itemValue: true,
                                    componentIds: ['q-how-much-was-award']
                                }
                            ]
                        }
                    },
                    'q-how-much-was-award': {
                        options: {
                            macroOptions: {
                                classes: 'govuk-input--width-10'
                            }
                        }
                    },
                    'q-when-will-you-find-out': {
                        options: {
                            macroOptions: {
                                classes: 'govuk-input--width-20'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-when-did-the-crime-start': {
            options: {
                properties: {
                    'q-applicant-when-did-the-crime-start': {
                        options: {
                            dateParts: {
                                day: false,
                                month: true,
                                year: true
                            }
                        }
                    }
                },
                outputOrder: [
                    'q-applicant-when-did-the-crime-start',
                    'i-dont-know-when-the-crime-started'
                ]
            }
        },
        'p-applicant-when-did-the-crime-stop': {
            options: {
                properties: {
                    'q-applicant-when-did-the-crime-stop': {
                        options: {
                            dateParts: {
                                day: false,
                                month: true,
                                year: true
                            }
                        }
                    }
                },
                outputOrder: [
                    'q-applicant-when-did-the-crime-stop',
                    'i-dont-know-when-the-crime-stopped'
                ]
            }
        },
        'p-applicant-enter-your-date-of-birth': {
            options: {
                properties: {
                    'q-applicant-enter-your-date-of-birth': {
                        options: {
                            autoComplete: true
                        }
                    }
                }
            }
        },
        'p--check-your-answers': {
            options: {
                isSummary: true,
                properties: {
                    'p-check-your-answers': {
                        options: {
                            summaryStructure: [
                                {
                                    title: 'Your details',
                                    questions: [
                                        'p-applicant-enter-your-name',
                                        'p-applicant-have-you-been-known-by-any-other-names',
                                        'p-applicant-what-other-names-have-you-used',
                                        'p-applicant-enter-your-date-of-birth',
                                        'p-applicant-enter-your-email-address',
                                        'p-applicant-enter-your-address',
                                        'p-applicant-enter-your-telephone-number',
                                        'p-applicant-british-citizen-or-eu-national',
                                        'p-applicant-are-you-18-or-over',
                                        'p-applicant-who-are-you-applying-for',
                                        'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse',
                                        'p-applicant-select-the-option-that-applies-to-you'
                                    ]
                                },
                                {
                                    title: 'About the crime',
                                    questions: [
                                        'p-applicant-did-the-crime-happen-once-or-over-time',
                                        'p-applicant-when-did-the-crime-happen',
                                        'p-applicant-when-did-the-crime-start',
                                        'p-applicant-when-did-the-crime-stop',
                                        'p-applicant-select-reasons-for-the-delay-in-making-your-application',
                                        'p-applicant-where-did-the-crime-happen',
                                        'p-applicant-where-in-england-did-it-happen',
                                        'p-applicant-where-in-scotland-did-it-happen',
                                        'p-applicant-where-in-wales-did-it-happen',
                                        'p-offender-do-you-know-the-name-of-the-offender',
                                        'p-offender-enter-offenders-name',
                                        'p-offender-describe-contact-with-offender'
                                    ]
                                },
                                {
                                    title: 'Police report',
                                    questions: [
                                        'p--was-the-crime-reported-to-police',
                                        'p--when-was-the-crime-reported-to-police',
                                        'p--whats-the-crime-reference-number',
                                        'p--which-english-police-force-is-investigating-the-crime',
                                        'p--which-police-scotland-division-is-investigating-the-crime',
                                        'p--which-welsh-police-force-is-investigating-the-crime',
                                        'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police'
                                    ]
                                },
                                {
                                    title: 'Other compensation',
                                    questions: [
                                        'p-applicant-have-you-applied-to-us-before',
                                        'p-applicant-have-you-applied-for-or-received-any-other-compensation',
                                        'p-applicant-other-compensation-details'
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        },
        'p-applicant-enter-your-address': {
            options: {
                properties: {
                    'q-applicant-building-and-street': {
                        options: {
                            macroOptions: {
                                classes: ''
                            }
                        }
                    },
                    'q-applicant-building-and-street-2': {
                        options: {
                            macroOptions: {
                                classes: ''
                            }
                        }
                    }
                },
                outputOrder: [
                    'q-applicant-building-and-street',
                    'q-applicant-building-and-street-2',
                    'q-applicant-town-or-city',
                    'q-applicant-county',
                    'q-applicant-postcode'
                ]
            }
        },
        'p--was-the-crime-reported-to-police': {
            options: {
                outputOrder: ['q--was-the-crime-reported-to-police', 'dont-know-if-crime-reported']
            }
        },
        'p-applicant-enter-your-name': {
            options: {
                outputOrder: [
                    'q-applicant-title',
                    'q-applicant-first-name',
                    'q-applicant-last-name'
                ]
            }
        },
        'p-applicant-select-reasons-for-the-delay-in-making-your-application': {
            options: {
                outputOrder: [
                    'q-applicant-explain-reason-for-delay-application',
                    'q-applicant-select-reasons-for-the-delay-in-making-your-application'
                ]
            }
        },
        'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police': {
            options: {
                outputOrder: [
                    'q-applicant-explain-reason-for-delay-reporting',
                    'q-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police'
                ]
            }
        },
        'p-applicant-select-the-option-that-applies-to-you': {
            options: {
                outputOrder: ['applicant-your-choices', 'q-applicant-option']
            }
        },
        'p-applicant-when-did-the-crime-happen': {
            options: {
                outputOrder: ['q-applicant-when-did-the-crime-happen', 'when-did-the-crime-happen']
            }
        },
        'p-applicant-where-in-england-did-it-happen': {
            options: {
                outputOrder: ['q-applicant-english-town-or-city', 'q-applicant-english-location']
            }
        },
        'p-applicant-where-in-wales-did-it-happen': {
            options: {
                outputOrder: ['q-applicant-welsh-town-or-city', 'q-applicant-welsh-location']
            }
        },
        'p-applicant-where-in-scotland-did-it-happen': {
            options: {
                outputOrder: ['q-applicant-scottish-town-or-city', 'q-applicant-scottish-location']
            }
        },
        'p-offender-describe-contact-with-offender': {
            options: {
                outputOrder: [
                    'q-offender-describe-contact-with-offender',
                    'q-offender-i-have-no-contact-with-offender'
                ]
            }
        }
    };

    beforeEach(() => {
        qTransformer = createQTransformer({
            default: defaultTransformer,
            govukSelect: govukSelectTransformer
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
            describe('And maxLength < 500 or not included', () => {
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
                                html: 'Event name'
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

                it('should add the auto-complete class to the govUk object. ', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'passport-sent',
                        schema: {
                            type: 'string',
                            title: 'Where should we send your passport?',
                            description: 'Enter an address'
                        },
                        uiSchema: {
                            'passport-sent': {
                                options: {
                                    autoComplete: 'street-address'
                                }
                            }
                        }
                    });

                    const expected = {
                        id: 'passport-sent',
                        dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                        componentName: 'govukInput',
                        macroOptions: {
                            label: {
                                html: 'Where should we send your passport?'
                            },
                            hint: {
                                text: 'Enter an address'
                            },
                            id: 'passport-sent',
                            name: 'passport-sent',
                            type: 'text',
                            autocomplete: 'street-address'
                        }
                    };

                    expect(result).toEqual(expected);
                });
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
                                classes: 'govuk-label govuk-label--l',
                                text: 'Can you provide more detail?'
                            },
                            hint: {
                                text:
                                    'Do not include personal or financial information, like your National Insurance number or credit card details.'
                            }
                        },
                        pageTitle: ''
                    };

                    expect(result).toEqual(expected);
                });

                it('should add the auto-complete class to the govUk object. ', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'more-detail',
                        schema: {
                            type: 'string',
                            maxLength: 500,
                            title: 'Can you provide more detail?',
                            description:
                                'Do not include personal or financial information, like your National Insurance number or credit card details.'
                        },
                        uiSchema: {
                            'more-detail': {
                                options: {
                                    autoComplete: 'street-address'
                                }
                            }
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
                                classes: 'govuk-label govuk-label--l',
                                text: 'Can you provide more detail?'
                            },
                            hint: {
                                text:
                                    'Do not include personal or financial information, like your National Insurance number or credit card details.'
                            },
                            autocomplete: 'street-address'
                        }
                    };

                    expect(result).toEqual(expected);
                });
            });

            describe('And a oneOf attribute with fewer than 20 options', () => {
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
                        },
                        pageTitle: ''
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
                        },
                        pageTitle: ''
                    };

                    expect(result).toEqual(expected);
                });

                it('should add the auto-complete class to the govUk object. ', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'passport-issued',
                        schema: {
                            type: 'string',
                            format: 'date-time', // https://www.iso.org/iso-8601-date-and-time-format.html
                            title: 'When was your passport issued?',
                            description: 'For example, 12 11 2007'
                        },
                        uiSchema: {
                            'passport-issued': {
                                options: {
                                    autoComplete: 'bday'
                                }
                            }
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
                                    autocomplete: 'bday-day'
                                },
                                {
                                    label: 'Month',
                                    classes: 'govuk-input--width-2',
                                    name: 'passport-issued[month]',
                                    autocomplete: 'bday-month'
                                },
                                {
                                    label: 'Year',
                                    classes: 'govuk-input--width-4',
                                    name: 'passport-issued[year]',
                                    autocomplete: 'bday-year'
                                }
                            ]
                        },
                        pageTitle: ''
                    };

                    expect(result).toEqual(expected);
                });
            });

            describe('And a oneOf attribute with greater than 20 options', () => {
                it('should convert it to a govukSelect instruction', () => {
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
                                },
                                {
                                    const: 'france',
                                    title: 'France'
                                },
                                {
                                    const: 'germany',
                                    title: 'Germany'
                                },
                                {
                                    const: 'spain',
                                    title: 'Spain'
                                },
                                {
                                    const: 'italy',
                                    title: 'Italy'
                                },
                                {
                                    const: 'switzerland',
                                    title: 'Switzerland'
                                },
                                {
                                    const: 'austria',
                                    title: 'Austria'
                                },
                                {
                                    const: 'poland',
                                    title: 'Poland'
                                },
                                {
                                    const: 'hungary',
                                    title: 'Hungary'
                                },
                                {
                                    const: 'netherlands',
                                    title: 'Netherlands'
                                },
                                {
                                    const: 'belgium',
                                    title: 'Belgium'
                                },
                                {
                                    const: 'denmark',
                                    title: 'Denmark'
                                },
                                {
                                    const: 'norway',
                                    title: 'Norway'
                                },
                                {
                                    const: 'sweden',
                                    title: 'Sweden'
                                },
                                {
                                    const: 'finland',
                                    title: 'Finland'
                                },
                                {
                                    const: 'croatia',
                                    title: 'Croatia'
                                },
                                {
                                    const: 'Czech Republic',
                                    title: 'Czech Republic'
                                }
                            ]
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        id: 'where-do-you-live',
                        dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
                        componentName: 'govukSelect',
                        macroOptions: {
                            name: 'where-do-you-live',
                            label: {
                                text: 'Where do you live?'
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
                                },
                                {
                                    value: 'france',
                                    text: 'France'
                                },
                                {
                                    value: 'germany',
                                    text: 'Germany'
                                },
                                {
                                    value: 'spain',
                                    text: 'Spain'
                                },
                                {
                                    value: 'italy',
                                    text: 'Italy'
                                },
                                {
                                    value: 'switzerland',
                                    text: 'Switzerland'
                                },
                                {
                                    value: 'austria',
                                    text: 'Austria'
                                },
                                {
                                    value: 'poland',
                                    text: 'Poland'
                                },
                                {
                                    value: 'hungary',
                                    text: 'Hungary'
                                },
                                {
                                    value: 'netherlands',
                                    text: 'Netherlands'
                                },
                                {
                                    value: 'belgium',
                                    text: 'Belgium'
                                },
                                {
                                    value: 'denmark',
                                    text: 'Denmark'
                                },
                                {
                                    value: 'norway',
                                    text: 'Norway'
                                },
                                {
                                    value: 'sweden',
                                    text: 'Sweden'
                                },
                                {
                                    value: 'finland',
                                    text: 'Finland'
                                },
                                {
                                    value: 'croatia',
                                    text: 'Croatia'
                                },
                                {
                                    value: 'Czech Republic',
                                    text: 'Czech Republic'
                                }
                            ]
                        },
                        pageTitle: ''
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
                    },
                    pageTitle: ''
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

                const expected = {
                    pageTitle: 'Email address - claim criminal injuries compensation - GOV.UK',
                    transformation: `{% from "input/macro.njk" import govukInput %}
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        {% from "details/macro.njk" import govukDetails %}
                        {{ govukInput({
                            "id": "email",
                            "name": "email",
                            "type": "email",
                            "label": {
                                "html": "Email address",
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
                                "html": "Phone number"
                            },
                            "hint": null
                        }) }}
                        {{ govukInput({
                            "id": "text",
                            "name": "text",
                            "type": "text",
                            "label": {
                                "html": "Mobile phone number"
                            },
                            "hint": null
                        }) }}
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}
                        `
                };

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
                                    }) }}`
                            }
                        }
                    },
                    uiSchema: {}
                });

                const expected = {
                    pageTitle: 'Event name - claim criminal injuries compensation - GOV.UK',
                    transformation: `
                        {% from "input/macro.njk" import govukInput %}
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        <h1 class="govuk-heading-xl">Event name</h1>
                        {{ govukInput({
                            "id": "email",
                            "name": "email",
                            "type": "email",
                            "label": {
                                "html": "Email address"
                            },
                            "hint": {
                                "text": "e.g. something@something.com"
                            }
                        }) }}
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}`
                };
                expect(removeIndentation(result.transformation)).toEqual(
                    removeIndentation(expected.transformation)
                );
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
                    },
                    pageTitle: ''
                };

                expect(result).toEqual(expected);
            });
        });

        describe('Given a JSON schema with only a SummaryInfo key', () => {
            it('should return a govukSummaryList instruction', () => {
                const result = qTransformer.transform({
                    schemaKey: 'p-check-your-answers',
                    schema: {
                        summaryInfo: {
                            'p-applicant-enter-your-name': {displayName: 'Name'}
                        }
                    },
                    uiSchema: {
                        'p-check-your-answers': {
                            options: {
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: [
                                            'p-applicant-enter-your-name',
                                            'p-applicant-have-you-been-known-by-any-other-names',
                                            'p-applicant-what-other-names-have-you-used',
                                            'p-applicant-enter-your-date-of-birth',
                                            'p-applicant-enter-your-email-address',
                                            'p-applicant-enter-your-address',
                                            'p-applicant-enter-your-telephone-number',
                                            'p-applicant-british-citizen-or-eu-national',
                                            'p-applicant-are-you-18-or-over',
                                            'p-applicant-who-are-you-applying-for',
                                            'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse',
                                            'p-applicant-select-the-option-that-applies-to-you'
                                        ]
                                    },
                                    {
                                        title: 'About the crime',
                                        questions: [
                                            'p-applicant-did-the-crime-happen-once-or-over-time',
                                            'p-applicant-when-did-the-crime-happen',
                                            'p-applicant-when-did-the-crime-start',
                                            'p-applicant-when-did-the-crime-stop',
                                            'p-applicant-select-reasons-for-the-delay-in-making-your-application',
                                            'p-applicant-where-did-the-crime-happen',
                                            'p-applicant-where-in-england-did-it-happen',
                                            'p-applicant-where-in-scotland-did-it-happen',
                                            'p-applicant-where-in-wales-did-it-happen',
                                            'p-offender-do-you-know-the-name-of-the-offender',
                                            'p-offender-enter-offenders-name',
                                            'p-offender-describe-contact-with-offender'
                                        ]
                                    },
                                    {
                                        title: 'Police report',
                                        questions: [
                                            'p--was-the-crime-reported-to-police',
                                            'p--when-was-the-crime-reported-to-police',
                                            'p--whats-the-crime-reference-number',
                                            'p--which-english-police-force-is-investigating-the-crime',
                                            'p--which-police-scotland-division-is-investigating-the-crime',
                                            'p--which-welsh-police-force-is-investigating-the-crime',
                                            'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police'
                                        ]
                                    },
                                    {
                                        title: 'Other compensation',
                                        questions: [
                                            'p-applicant-have-you-applied-to-us-before',
                                            'p-applicant-have-you-applied-for-or-received-any-other-compensation',
                                            'p-applicant-other-compensation-details'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    data: {
                        'p-applicant-enter-your-name': {
                            'q-applicant-title': 'Mr',
                            'q-applicant-first-name': 'Barry',
                            'q-applicant-last-name': 'Piccinni'
                        }
                    },
                    fullUiSchema: uiSchema
                });

                const expected = {
                    componentName: 'summary',
                    content:
                        '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Barry Piccinni"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}<h2 class="govuk-heading-l">Police report</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}<h2 class="govuk-heading-l">Other compensation</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                    dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
                    id: 'p-check-your-answers'
                };

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });

            it('should return a govukSummaryList instructions under the correct headings', () => {
                const result = qTransformer.transform({
                    schemaKey: 'p-check-your-answers',
                    schema: {
                        summaryInfo: {
                            'p-applicant-enter-your-name': {displayName: 'Name'},
                            'p-applicant-when-did-the-crime-happen': {
                                displayName: 'When did the crime happen?'
                            }
                        }
                    },
                    uiSchema: {
                        'p-check-your-answers': {
                            options: {
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: [
                                            'p-applicant-enter-your-name',
                                            'p-applicant-have-you-been-known-by-any-other-names',
                                            'p-applicant-what-other-names-have-you-used',
                                            'p-applicant-enter-your-date-of-birth',
                                            'p-applicant-enter-your-email-address',
                                            'p-applicant-enter-your-address',
                                            'p-applicant-enter-your-telephone-number',
                                            'p-applicant-british-citizen-or-eu-national',
                                            'p-applicant-are-you-18-or-over',
                                            'p-applicant-who-are-you-applying-for',
                                            'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse',
                                            'p-applicant-select-the-option-that-applies-to-you'
                                        ]
                                    },
                                    {
                                        title: 'About the crime',
                                        questions: [
                                            'p-applicant-did-the-crime-happen-once-or-over-time',
                                            'p-applicant-when-did-the-crime-happen',
                                            'p-applicant-when-did-the-crime-start',
                                            'p-applicant-when-did-the-crime-stop',
                                            'p-applicant-select-reasons-for-the-delay-in-making-your-application',
                                            'p-applicant-where-did-the-crime-happen',
                                            'p-applicant-where-in-england-did-it-happen',
                                            'p-applicant-where-in-scotland-did-it-happen',
                                            'p-applicant-where-in-wales-did-it-happen',
                                            'p-offender-do-you-know-the-name-of-the-offender',
                                            'p-offender-enter-offenders-name',
                                            'p-offender-describe-contact-with-offender'
                                        ]
                                    },
                                    {
                                        title: 'Police report',
                                        questions: [
                                            'p--was-the-crime-reported-to-police',
                                            'p--when-was-the-crime-reported-to-police',
                                            'p--whats-the-crime-reference-number',
                                            'p--which-english-police-force-is-investigating-the-crime',
                                            'p--which-police-scotland-division-is-investigating-the-crime',
                                            'p--which-welsh-police-force-is-investigating-the-crime',
                                            'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police'
                                        ]
                                    },
                                    {
                                        title: 'Other compensation',
                                        questions: [
                                            'p-applicant-have-you-applied-to-us-before',
                                            'p-applicant-have-you-applied-for-or-received-any-other-compensation',
                                            'p-applicant-other-compensation-details'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    data: {
                        'p-applicant-enter-your-name': {
                            'q-applicant-last-name': 'Piccinni',
                            'q-applicant-first-name': 'Barry',
                            'q-applicant-title': 'Mr'
                        },
                        'p-applicant-when-did-the-crime-happen': {
                            'q-applicant-when-did-the-crime-happen': '2019-01-01T09:55:22.130Z'
                        }
                    },
                    fullUiSchema: uiSchema
                });

                const expected = {
                    componentName: 'summary',
                    content:
                        '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Barry Piccinni"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-when-did-the-crime-happen?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "When did the crime happen?"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">Police report</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}<h2 class="govuk-heading-l">Other compensation</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                    dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
                    id: 'p-check-your-answers'
                };

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });

            it('should return a govukSummaryList in the order defined in the uiSchema', () => {
                const result = qTransformer.transform({
                    schemaKey: 'p-check-your-answers',
                    schema: {
                        summaryInfo: {
                            'p-applicant-enter-your-name': {displayName: 'Name'},
                            'p-applicant-when-did-the-crime-happen': {
                                displayName: 'When did the crime happen?'
                            }
                        }
                    },
                    uiSchema: {
                        'p-check-your-answers': {
                            options: {
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: [
                                            'p-applicant-enter-your-name',
                                            'p-applicant-have-you-been-known-by-any-other-names',
                                            'p-applicant-what-other-names-have-you-used',
                                            'p-applicant-enter-your-date-of-birth',
                                            'p-applicant-enter-your-email-address',
                                            'p-applicant-enter-your-address',
                                            'p-applicant-enter-your-telephone-number',
                                            'p-applicant-british-citizen-or-eu-national',
                                            'p-applicant-are-you-18-or-over',
                                            'p-applicant-who-are-you-applying-for',
                                            'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse',
                                            'p-applicant-select-the-option-that-applies-to-you'
                                        ]
                                    },
                                    {
                                        title: 'About the crime',
                                        questions: [
                                            'p-applicant-did-the-crime-happen-once-or-over-time',
                                            'p-applicant-when-did-the-crime-happen',
                                            'p-applicant-when-did-the-crime-start',
                                            'p-applicant-when-did-the-crime-stop',
                                            'p-applicant-select-reasons-for-the-delay-in-making-your-application',
                                            'p-applicant-where-did-the-crime-happen',
                                            'p-applicant-where-in-england-did-it-happen',
                                            'p-applicant-where-in-scotland-did-it-happen',
                                            'p-applicant-where-in-wales-did-it-happen',
                                            'p-offender-do-you-know-the-name-of-the-offender',
                                            'p-offender-enter-offenders-name',
                                            'p-offender-describe-contact-with-offender'
                                        ]
                                    },
                                    {
                                        title: 'Police report',
                                        questions: [
                                            'p--was-the-crime-reported-to-police',
                                            'p--when-was-the-crime-reported-to-police',
                                            'p--whats-the-crime-reference-number',
                                            'p--which-english-police-force-is-investigating-the-crime',
                                            'p--which-police-scotland-division-is-investigating-the-crime',
                                            'p--which-welsh-police-force-is-investigating-the-crime',
                                            'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police'
                                        ]
                                    },
                                    {
                                        title: 'Other compensation',
                                        questions: [
                                            'p-applicant-have-you-applied-to-us-before',
                                            'p-applicant-have-you-applied-for-or-received-any-other-compensation',
                                            'p-applicant-other-compensation-details'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    data: {
                        'p-applicant-enter-your-name': {
                            'q-applicant-last-name': 'Piccinni',
                            'q-applicant-first-name': 'Barry',
                            'q-applicant-title': 'Mr'
                        },
                        'p-applicant-when-did-the-crime-happen': {
                            'q-applicant-when-did-the-crime-happen': '2019-01-01T09:55:22.130Z'
                        }
                    },
                    fullUiSchema: uiSchema
                });

                const expected = {
                    componentName: 'summary',
                    content:
                        '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Barry Piccinni"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-when-did-the-crime-happen?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "When did the crime happen?"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">Police report</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}<h2 class="govuk-heading-l">Other compensation</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: []\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                    dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
                    id: 'p-check-your-answers'
                };

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
            });

            it('should return a govukSummaryList in the order defined in the uiSchema and append answers which are supplied in the body but not defined in the uiSchema', () => {
                const result = qTransformer.transform({
                    schemaKey: 'p-summary',
                    schema: {
                        summaryInfo: {
                            'p-some-section': {displayName: 'Name'}
                        }
                    },
                    uiSchema: {
                        'p-summary': {
                            options: {
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: ['p-some-section']
                                    }
                                ]
                            }
                        }
                    },
                    data: {
                        'p-some-section': {
                            'q-3': 'Piccinni',
                            'q-2': 'Barry',
                            'q-1': 'Mr',
                            'q-5': 'blah',
                            'q-4': 'foo'
                        }
                    },
                    fullUiSchema: {
                        'p-summary': {
                            options: {
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: ['p-some-section']
                                    }
                                ]
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
                        '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr<br>Barry<br>Piccinni<br>blah<br>foo"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/some-section?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                    dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
                    id: 'p-summary'
                };

                expect(removeIndentation(result)).toEqual(removeIndentation(expected));
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

                    const expected = {
                        pageTitle:
                            'How would you prefer to be contacted? - claim criminal injuries compensation - GOV.UK',
                        transformation: `
                            {% from "input/macro.njk" import govukInput %}
                            {% from "radios/macro.njk" import govukRadios %}
                            {% set email %}{{ govukInput({
                                "id": "email",
                                "name": "email",
                                "type": "email",
                                "label": {
                                    "html": "Email address"
                                },
                                "hint": {
                                    "text": "e.g. something@something.com"
                                }
                            }) }}{% endset -%}
                            {% set phone %}{{ govukInput({
                                "id": "phone",
                                "name": "phone",
                                "type": "text",
                                "label": {
                                    "html": "Phone number"
                                },
                                "hint": null
                            }) }}{% endset -%}
                            {% set text %}{{ govukInput({
                                "id": "text",
                                "name": "text",
                                "type": "text",
                                "label": {
                                    "html": "Mobile phone number"
                                },
                                "hint": null
                            }) }}{% endset -%}{{ govukRadios({
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
                                            "html": ([email] | join())
                                        }
                                    },
                                    {
                                        "value": "phone",
                                        "text": "Phone",
                                        "conditional": {
                                            "html": ([phone] | join())
                                        }
                                    },
                                    {
                                        "value": "text",
                                        "text": "Text message",
                                        "conditional": {
                                            "html": ([text] | join())
                                        }
                                    }
                                ]
                            }) }}`
                    };

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
                    const expected = {
                        pageTitle:
                            'How would you prefer to be contacted? - claim criminal injuries compensation - GOV.UK',
                        transformation: `
                            {% from "input/macro.njk" import govukInput %}
                            {% from "radios/macro.njk" import govukRadios %}
                            {% set email %}{{ govukInput({
                                "id": "email",
                                "name": "email",
                                "type": "email",
                                "label": {
                                    "html": "Email address"
                                },
                                "hint": {
                                    "text": "e.g. something@something.com"
                                }
                            }) }}{% endset -%}
                            {% set phone %}{{ govukInput({
                                "id": "phone",
                                "name": "phone",
                                "type": "text",
                                "label": {
                                    "html": "Phone number"
                                },
                                "hint": null
                            }) }}{% endset -%}
                            {% set text %}{{ govukInput({
                                "id": "text",
                                "name": "text",
                                "type": "text",
                                "label": {
                                    "html": "Mobile phone number"
                                },
                                "hint": null
                            }) }}{% endset -%}{{ govukRadios({
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
                                            "html": ([email, phone, text] | join())
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
                            }) }}`
                    };
                    expect(result.transformation.replace(/\s+/g, '')).toEqual(
                        expected.transformation.replace(/\s+/g, '')
                    );
                });

                it('should convert it to a govukRadios with properly escaped user answers', () => {
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
                        },
                        data: {
                            text: '"><script>alert("hello");</script>'
                        }
                    });
                    const expected = {
                        pageTitle:
                            'How would you prefer to be contacted? - claim criminal injuries compensation - GOV.UK',
                        transformation: `
                        {% from "input/macro.njk" import govukInput %}
                        {% from "radios/macro.njk" import govukRadios %}
                        {% set email %}{{ govukInput({
                            "id": "email",
                            "name": "email",
                            "type": "email",
                            "label": {
                                "html": "Email address"
                            },
                            "hint": {
                                "text": "e.g. something@something.com"
                            }
                        }) }}{% endset -%}
                        {% set phone %}{{ govukInput({
                            "id": "phone",
                            "name": "phone",
                            "type": "text",
                            "label": {
                                "html": "Phone number"
                            },
                            "hint": null
                        }) }}{% endset -%}
                        {% set text %}{{ govukInput({
                            "id": "text",
                            "name": "text",
                            "type": "text",
                            "label": {
                                "html": "Mobile phone number"
                            },
                            "hint": null,
                            "value": "\\"><script>alert(\\"hello\\");</script>"
                        }) }}{% endset -%}{{ govukRadios({
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
                                        "html": ([email] | join())
                                    }
                                },
                                {
                                    "value": "phone",
                                    "text": "Phone",
                                    "conditional": {
                                        "html": ([phone] | join())
                                    }
                                },
                                {
                                    "value": "text",
                                    "text": "Text message",
                                    "conditional": {
                                        "html": ([text] | join())
                                    }
                                }
                            ]
                        }) }}`
                    };

                    expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                });

                it('should ensure the conditional component ids have any invalid characters replaced with "_"', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'p-some-id',
                        schema: {
                            type: 'object',
                            propertyNames: {
                                enum: [
                                    'contact',
                                    'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email'
                                ]
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
                                        }
                                    ]
                                },
                                'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email': {
                                    type: 'string',
                                    description: 'e.g. something@something.com',
                                    format: 'email',
                                    title: 'Email address'
                                }
                            },
                            required: ['contact'],
                            allOf: [
                                {$ref: '#/definitions/if-email-contact-then-email-is-required'}
                            ],
                            definitions: {
                                'if-email-contact-then-email-is-required': {
                                    if: {
                                        properties: {
                                            contact: {const: 'email'}
                                        }
                                    },
                                    then: {
                                        required: [
                                            'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email'
                                        ],
                                        propertyNames: {
                                            enum: [
                                                'contact',
                                                'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email'
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        uiSchema: {
                            'p-some-id': {
                                // transformer: 'form',
                                options: {
                                    transformOrder: [
                                        'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email',
                                        'contact'
                                    ],
                                    outputOrder: ['contact'],
                                    properties: {
                                        contact: {
                                            // transformer: 'govukRadios',
                                            options: {
                                                conditionalComponentMap: [
                                                    {
                                                        itemValue: 'email',
                                                        componentIds: [
                                                            'this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email'
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                    const expected = {
                        pageTitle:
                            'How would you prefer to be contacted? - claim criminal injuries compensation - GOV.UK',
                        transformation: `{% from "input/macro.njk" import govukInput %}
                            {% from "radios/macro.njk" import govukRadios %}
                            {% set this_id_cant_be_used_as_a_variable_identifier_as_it_contains_hyphens_email %}{{ govukInput({
                                "id": "this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email",
                                "name": "this-id-cant-be-used-as-a-variable-identifier-as-it-contains-hyphens-email",
                                "type": "email",
                                "label": {
                                    "html": "Email address"
                                },
                                "hint": {
                                    "text": "e.g. something@something.com"
                                }
                            }) }}{% endset -%}{{ govukRadios({
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
                                            "html": ([this_id_cant_be_used_as_a_variable_identifier_as_it_contains_hyphens_email] | join())
                                        }
                                    }
                                ]
                            }) }}`
                    };

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

            const expected = {
                pageTitle: 'Email address - claim criminal injuries compensation - GOV.UK',
                transformation: `{% from "input/macro.njk" import govukInput %}
                    {{ govukInput({
                        "id": "email",
                        "name": "email",
                        "type": "email",
                        "label": {
                            "html": "Email address",
                            "isPageHeading": true,
                            "classes": "govuk-label--xl"
                        },
                        "hint": {
                            "text": "e.g. something@something.com"
                        },
                        "value": "peppa@peppapig.com"
                    }) }}`
            };

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
                        html: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    value: 'Peppa Pig'
                },
                pageTitle: ''
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
                },
                pageTitle: ''
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
                    waste: ['mines', 'farm']
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
                },
                pageTitle: ''
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
                        text: 'Can you provide more detail?',
                        classes: 'govuk-label govuk-label--l'
                    },
                    hint: {
                        text:
                            'Do not include personal or financial information, like your National Insurance number or credit card details.'
                    },
                    value: 'Peppa Pig'
                },
                pageTitle: ''
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
                },
                pageTitle: ''
            };

            expect(result).toEqual(expected);
        });

        it('should pre-populate a govukSelect instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'sort',
                schema: {
                    title: 'Sort by',
                    type: 'string',
                    oneOf: [
                        {
                            const: 'published',
                            title: 'Recently published'
                        },
                        {
                            const: 'updated',
                            title: 'Recently updated'
                        },
                        {
                            const: 'views',
                            title: 'Most views'
                        },
                        {
                            const: 'comments',
                            title: 'Most comments'
                        }
                    ]
                },
                uiSchema: {
                    sort: {
                        transformer: 'govukSelect'
                    }
                },
                data: {
                    sort: 'updated'
                }
            });

            const expected = {
                id: 'sort',
                dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
                componentName: 'govukSelect',
                macroOptions: {
                    name: 'sort',
                    hint: null,
                    label: {
                        text: 'Sort by'
                    },
                    items: [
                        {
                            value: 'published',
                            text: 'Recently published'
                        },
                        {
                            value: 'updated',
                            text: 'Recently updated',
                            selected: true
                        },
                        {
                            value: 'views',
                            text: 'Most views'
                        },
                        {
                            value: 'comments',
                            text: 'Most comments'
                        }
                    ]
                },
                pageTitle: ''
            };

            expect(result).toEqual(expected);
        });

        it('should pre-populate a govukSelect instruction and deselect the default item', () => {
            const result = qTransformer.transform({
                schemaKey: 'sort',
                schema: {
                    title: 'Sort by',
                    type: 'string',
                    oneOf: [
                        {
                            const: 'published',
                            title: 'Recently published'
                        },
                        {
                            const: 'updated',
                            title: 'Recently updated'
                        },
                        {
                            const: 'views',
                            title: 'Most views'
                        },
                        {
                            const: 'comments',
                            title: 'Most comments'
                        }
                    ]
                },
                uiSchema: {
                    sort: {
                        transformer: 'govukSelect',
                        options: {
                            defaultItem: {
                                value: '',
                                text: 'Please select',
                                selected: true
                            }
                        }
                    }
                },
                data: {
                    sort: 'updated'
                }
            });

            const expected = {
                id: 'sort',
                dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
                componentName: 'govukSelect',
                macroOptions: {
                    name: 'sort',
                    hint: null,
                    label: {
                        text: 'Sort by'
                    },
                    items: [
                        {
                            value: '',
                            text: 'Please select',
                            selected: false
                        },
                        {
                            value: 'published',
                            text: 'Recently published'
                        },
                        {
                            value: 'updated',
                            text: 'Recently updated',
                            selected: true
                        },
                        {
                            value: 'views',
                            text: 'Most views'
                        },
                        {
                            value: 'comments',
                            text: 'Most comments'
                        }
                    ]
                },
                pageTitle: ''
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
                        html: 'Event name'
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
                },
                pageTitle: 'Error: '
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
                errorSummaryHREF: '#event-name-event-name[day]',
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
                },
                pageTitle: 'Error: '
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
                errorSummaryHREF: '#waste[]',
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
                },
                pageTitle: 'Error: '
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
                errorSummaryHREF: '#changed-name',
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
                },
                pageTitle: 'Error: '
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
                        text: 'Can you provide more detail?',
                        classes: 'govuk-label govuk-label--l'
                    },
                    errorMessage: {
                        text: 'Please enter more details'
                    },
                    hint: {
                        text:
                            'Do not include personal or financial information, like your National Insurance number or credit card details.'
                    },
                    value: 123
                },
                pageTitle: 'Error: '
            };

            expect(result).toEqual(expected);
        });

        it('should display an error summary at the top', () => {
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
                    email: 'Please enter a value',
                    phone: 'This is not a valid type'
                }
            });

            const expected = {
                pageTitle: 'Error: Email address - claim criminal injuries compensation - GOV.UK',
                transformation: `
                {% from "error-summary/macro.njk" import govukErrorSummary %}
                    {{ govukErrorSummary({
                        titleText: "There is a problem",
                        errorList: [
                            {
                                "href": "#email",
                                "text": "Please enter a value"
                            },
                            {
                                "href": "#phone",
                                "text": "This is not a valid type"
                            }
                    ]}) }}
                    {% from "input/macro.njk" import govukInput %}
                    {% from "warning-text/macro.njk" import govukWarningText %}
                    {% from "details/macro.njk" import govukDetails %}
                    {{ govukInput({
                        "id": "email",
                        "name": "email",
                        "type": "email",
                        "label": {
                            "html": "Email address",
                            "isPageHeading": true,
                            "classes": "govuk-label--xl"
                        },
                        "hint": {
                            "text": "e.g. something@something.com"
                        },
                        "errorMessage": {
                            "text": "Please enter a value"
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
                            "html": "Phone number"
                        },
                        "hint": null,
                        "errorMessage": {
                            "text": "This is not a valid type"
                        }
                    }) }}
                    {{ govukInput({
                        "id": "text",
                        "name": "text",
                        "type": "text",
                        "label": {
                            "html": "Mobile phone number"
                        },
                        "hint": null
                    }) }}
                    <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                    {{ govukWarningText({
                        text: "You could be prosecuted or get less compensation if you give false or misleading information."
                    }) }}
                    `
            };

            expect(removeIndentation(result.transformation)).toEqual(
                removeIndentation(expected.transformation)
            );
        });

        it('should display errors for govukSelect instruction', () => {
            const result = qTransformer.transform({
                schemaKey: 'where-do-you-live',
                schema: {
                    title: 'Where do you live?',
                    type: 'string',
                    description: 'Select all that apply.',
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
                        },
                        {
                            const: 'france',
                            title: 'France'
                        },
                        {
                            const: 'germany',
                            title: 'Germany'
                        },
                        {
                            const: 'spain',
                            title: 'Spain'
                        },
                        {
                            const: 'italy',
                            title: 'Italy'
                        },
                        {
                            const: 'switzerland',
                            title: 'Switzerland'
                        },
                        {
                            const: 'austria',
                            title: 'Austria'
                        },
                        {
                            const: 'poland',
                            title: 'Poland'
                        },
                        {
                            const: 'hungary',
                            title: 'Hungary'
                        },
                        {
                            const: 'netherlands',
                            title: 'Netherlands'
                        },
                        {
                            const: 'belgium',
                            title: 'Belgium'
                        },
                        {
                            const: 'denmark',
                            title: 'Denmark'
                        },
                        {
                            const: 'norway',
                            title: 'Norway'
                        },
                        {
                            const: 'sweden',
                            title: 'Sweden'
                        },
                        {
                            const: 'finland',
                            title: 'Finland'
                        },
                        {
                            const: 'croatia',
                            title: 'Croatia'
                        },
                        {
                            const: 'Czech Republic',
                            title: 'Czech Republic'
                        }
                    ]
                },
                uiSchema: {},
                data: {
                    'where-do-you-live': "something that doesn't match any of the items" // this should cause an error
                },
                schemaErrors: {
                    'where-do-you-live': 'Please select an option'
                }
            });

            const expected = {
                id: 'where-do-you-live',
                dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
                componentName: 'govukSelect',
                macroOptions: {
                    name: 'where-do-you-live',
                    label: {
                        text: 'Where do you live?'
                    },
                    hint: {
                        text: 'Select all that apply.'
                    },
                    errorMessage: {
                        text: 'Please select an option'
                    },
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
                        },
                        {
                            value: 'france',
                            text: 'France'
                        },
                        {
                            value: 'germany',
                            text: 'Germany'
                        },
                        {
                            value: 'spain',
                            text: 'Spain'
                        },
                        {
                            value: 'italy',
                            text: 'Italy'
                        },
                        {
                            value: 'switzerland',
                            text: 'Switzerland'
                        },
                        {
                            value: 'austria',
                            text: 'Austria'
                        },
                        {
                            value: 'poland',
                            text: 'Poland'
                        },
                        {
                            value: 'hungary',
                            text: 'Hungary'
                        },
                        {
                            value: 'netherlands',
                            text: 'Netherlands'
                        },
                        {
                            value: 'belgium',
                            text: 'Belgium'
                        },
                        {
                            value: 'denmark',
                            text: 'Denmark'
                        },
                        {
                            value: 'norway',
                            text: 'Norway'
                        },
                        {
                            value: 'sweden',
                            text: 'Sweden'
                        },
                        {
                            value: 'finland',
                            text: 'Finland'
                        },
                        {
                            value: 'croatia',
                            text: 'Croatia'
                        },
                        {
                            value: 'Czech Republic',
                            text: 'Czech Republic'
                        }
                    ]
                },
                pageTitle: 'Error: '
            };

            expect(result).toEqual(expected);
        });
    });

    describe('Display text inputs with appropriate classes', () => {
        it('should add "width-10" class if text input has maxLength less than 20', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material.",
                    maxLength: 19
                },
                uiSchema: {}
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        html: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    classes: 'govuk-input--width-10'
                },
                pageTitle: ''
            };

            expect(expected).toEqual(result);
        });

        it('should add "width-20" class if text input has maxLength more than or equal to 20 but less than 60', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material.",
                    maxLength: 20
                },
                uiSchema: {}
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        html: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    classes: 'govuk-input--width-20'
                },
                pageTitle: ''
            };

            expect(expected).toEqual(result);
        });

        it('should add "width-30" class if text input has maxLength more than or equal to 60 but less than 500', () => {
            const result = qTransformer.transform({
                schemaKey: 'event-name',
                schema: {
                    type: 'string',
                    title: 'Event name',
                    description: "The name you'll use on promotional material.",
                    maxLength: 60
                },
                uiSchema: {}
            });

            const expected = {
                id: 'event-name',
                dependencies: ['{% from "input/macro.njk" import govukInput %}'],
                componentName: 'govukInput',
                macroOptions: {
                    label: {
                        html: 'Event name'
                    },
                    hint: {
                        text: "The name you'll use on promotional material."
                    },
                    id: 'event-name',
                    name: 'event-name',
                    type: 'text',
                    classes: 'govuk-input--width-30'
                },
                pageTitle: ''
            };

            expect(result).toEqual(expected);
        });
    });

    describe('Display the summary page', () => {
        it('should display the accept and submit button', () => {
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
                        }
                    }
                },
                uiSchema: {
                    'event-name': {
                        options: {
                            isSummary: true
                        }
                    }
                }
            });

            const expected = {
                pageTitle: 'Email address - claim criminal injuries compensation - GOV.UK',
                transformation: `
                    {% from "input/macro.njk" import govukInput %}
                    {{ govukInput({
                        "id": "email",
                        "name": "email",
                        "type": "email",
                        "label": {
                            "html": "Email address",
                            "isPageHeading": true,
                            "classes": "govuk-label--xl"
                        },
                        "hint": {
                            "text": "e.g. something@something.com"
                        }
                    }) }}
                `
            };
            expect(result.transformation.replace(/\s+/g, '')).toEqual(
                expected.transformation.replace(/\s+/g, '')
            );
        });
    });

    describe('Helper tests', () => {
        let formattedAnswer = [];

        describe('Answer helper', () => {
            describe('Dynamic answer formatter', () => {
                beforeAll(() => {
                    const answerObject = {
                        'p--start-now': {},
                        'p-applicant-declaration': {},
                        'p-applicant-british-citizen-or-eu-national': {
                            'q-applicant-british-citizen-or-eu-national': 'true'
                        },
                        'p-applicant-are-you-18-or-over': {
                            'q-applicant-are-you-18-or-over': 'true'
                        },
                        'p-applicant-who-are-you-applying-for': {
                            'q-applicant-who-are-you-applying-for': 'myself'
                        },
                        'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse': {
                            'q-applicant-were-you-a-victim-of-sexual-assault-or-abuse': true
                        },
                        'p--before-you-continue': {},
                        'p-applicant-select-the-option-that-applies-to-you': {
                            'q-applicant-option': 'opt1'
                        },
                        'p--was-the-crime-reported-to-police': {
                            'q-was-the-crime-reported-to-police': 'false'
                        },
                        'p--when-was-the-crime-reported-to-police': {
                            'q--when-was-the-crime-reported-to-police': '2019-01-01T09:55:22.130Z'
                        },
                        'p-applicant-enter-your-name': {
                            'q-applicant-title': 'Mr',
                            'q-applicant-first-name': 'Barry',
                            'q-applicant-last-name': 'Piccinni'
                        },
                        'p-applicant-enter-your-address': {
                            'q-applicant-building-and-street': 'Alexander Bain House',
                            'q-applicant-building-and-street-2': 'Atlantic Quay',
                            'q-applicant-town-or-city': 'Glasgow',
                            'q-applicant-county': '',
                            'q-applicant-postcode': 'G2 8JQ'
                        }
                    };
                    formattedAnswer = answerFormatHelper.summaryFormatter(answerObject, uiSchema);
                });

                it('should format all responses into simple objects containing a value key and a href key', () => {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const answer in formattedAnswer) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (formattedAnswer.hasOwnProperty(answer)) {
                            expect(Object.keys(formattedAnswer[answer])).toContain('value');
                            expect(Object.keys(formattedAnswer[answer])).toContain('href');
                        }
                    }
                });

                it('should format all true/false answers to "Yes" or "No"', () => {
                    const answerValues = [];
                    // eslint-disable-next-line no-restricted-syntax
                    for (const answer in formattedAnswer) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (formattedAnswer.hasOwnProperty(answer)) {
                            answerValues.push(formattedAnswer[answer].value);
                        }
                    }

                    expect(answerValues).not.toContain('true');
                    expect(answerValues).not.toContain('false');
                    expect(answerValues).toContain('Yes');
                    expect(answerValues).toContain('No');
                });

                it('should format a question with more than one but less than 4 answers on a single line', () => {
                    expect(formattedAnswer['p-applicant-enter-your-name'].value).toMatch(
                        'Mr Barry Piccinni'
                    );
                });

                it('should format a question with 4 or more answers appears in a multi-line format', () => {
                    expect(formattedAnswer['p-applicant-enter-your-address'].value).toMatch(
                        'Alexander Bain House<br>Atlantic Quay<br>Glasgow<br>G2 8JQ'
                    );
                });

                it('should correctly build the url for each question', () => {
                    expect(formattedAnswer['p-applicant-enter-your-address'].href).toMatch(
                        '/apply/applicant-enter-your-address?next=check-your-answers'
                    );
                    expect(formattedAnswer['p-applicant-enter-your-name'].href).toMatch(
                        '/apply/applicant-enter-your-name?next=check-your-answers'
                    );
                    expect(
                        formattedAnswer['p-applicant-were-you-a-victim-of-sexual-assault-or-abuse']
                            .href
                    ).toMatch(
                        '/apply/applicant-were-you-a-victim-of-sexual-assault-or-abuse?next=check-your-answers'
                    );
                });
            });
            describe('Helper Methods', () => {
                describe('isValidDate', () => {
                    it('should return true is a valid date is entered', () => {
                        const trueString = '2019-01-01T09:55:22.130Z';
                        const falseString = 'not-a-date';

                        const actual1 = answerFormatHelper.isValidDate(trueString);
                        const actual2 = answerFormatHelper.isValidDate(falseString);

                        expect(actual1).toBeTruthy();
                        expect(actual2).not.toBeTruthy();
                    });
                });
                describe('dateFormatter', () => {
                    it('should return a date in a readable format', () => {
                        const dateString = '2019-01-01T09:55:22.130Z';

                        const actual = answerFormatHelper.dateFormatter(dateString);

                        expect(actual).toMatch('01 January 2019');
                    });
                });
                describe('multipleAnswersFormat', () => {
                    describe('questions with more than 1 but less than 5 fields', () => {
                        it('should return all fields except boolean on a single line separated by spaces', () => {
                            const inputString = {
                                'q-applicant-building-and-street': 'Alexander Bain House',
                                'q-applicant-town-or-city': 'Glasgow',
                                'q-applicant-postcode': 'G2 8JQ'
                            };

                            const actual = answerFormatHelper.multipleAnswersFormat(inputString);

                            expect(actual).toMatch('Alexander Bain House Glasgow G2 8JQ');
                        });

                        it('should return boolean fields on a single comma separated line', () => {
                            const inputString = {
                                'q-do-you-live-in-glasgow': true,
                                'q-applicant-town-or-city': 'Glasgow',
                                'q-applicant-postcode': 'G2 8JQ'
                            };

                            const actual = answerFormatHelper.multipleAnswersFormat(inputString);

                            expect(actual).toMatch('Yes, Glasgow G2 8JQ');
                        });
                    });

                    describe('questions with more than 4 fields', () => {
                        it('should return as a multi-row string', () => {
                            const inputString = {
                                'q-applicant-building-and-street': 'Alexander Bain House',
                                'q-applicant-building-and-street2': 'Atlantic Quay',
                                'q-applicant-town-or-city': 'Glasgow',
                                'q-applicant-county': '',
                                'q-applicant-postcode': 'G2 8JQ'
                            };

                            const actual = answerFormatHelper.multipleAnswersFormat(inputString);

                            expect(actual).toMatch(
                                'Alexander Bain House<br>Atlantic Quay<br>Glasgow<br>G2 8JQ'
                            );
                        });
                    });
                });
                describe('escapeHtml', () => {
                    it('should replace potentially harmful HTML characters with a safe alternative', () => {
                        const badString = `<html>&I am a "bad" 'string'</html>`;
                        const expected = `&lt;html&gt;&amp;I am a &quot;bad&quot; &#039;string&#039;&lt;/html&gt;`;

                        const actual = answerFormatHelper.escapeHtml(badString);

                        expect(actual).toMatch(expected);
                    });
                });
            });
            describe('arrayFormatter', () => {
                it('should return all the elements of an array on a new line', () => {
                    const inputArray = ['i-am-an-answer', 'another-answer', 'a-third-answer'];

                    const actual = answerFormatHelper.arrayFormatter(inputArray);

                    expect(actual).toMatch(
                        'i-am-an-answer<br>another-answer<br>a-third-answer<br>'
                    );
                });
            });
        });

        describe('Police lookup', () => {
            it('Should return the name of a police force given the index code.', () => {
                const ayrshirePoliceIndex = 12157147;
                const actual = policeLookup(ayrshirePoliceIndex);
                const expected = 'Scotland Ayrshire';

                expect(actual).toMatch(expected);
            });
        });

        describe('Answer lookup', () => {
            it('Should return the user friendly display name, given an answer ID.', () => {
                const iWasUnder18AnswerId = 'i-was-under-18';
                const actual = answerLookup(iWasUnder18AnswerId);
                const expected = 'I was under 18';

                expect(actual).toMatch(expected);
            });
        });
    });

    describe('govukSelect transformer', () => {
        it('should allow a default option to be injected in to its list of options e.g. "Please select"', () => {
            const result = qTransformer.transform({
                schemaKey: 'sort',
                schema: {
                    title: 'Sort by',
                    type: 'string',
                    oneOf: [
                        {
                            const: 'published',
                            title: 'Recently published'
                        },
                        {
                            const: 'updated',
                            title: 'Recently updated'
                        },
                        {
                            const: 'views',
                            title: 'Most views'
                        },
                        {
                            const: 'comments',
                            title: 'Most comments'
                        }
                    ]
                },
                uiSchema: {
                    sort: {
                        transformer: 'govukSelect',
                        options: {
                            defaultItem: {
                                value: '',
                                text: 'Please select'
                            }
                        }
                    }
                },
                data: {
                    sort: 'updated'
                }
            });

            const expected = {
                id: 'sort',
                dependencies: ['{% from "select/macro.njk" import govukSelect %}'],
                componentName: 'govukSelect',
                macroOptions: {
                    name: 'sort',
                    hint: null,
                    label: {
                        text: 'Sort by'
                    },
                    items: [
                        {
                            value: '',
                            text: 'Please select',
                            selected: false
                        },
                        {
                            value: 'published',
                            text: 'Recently published'
                        },
                        {
                            value: 'updated',
                            text: 'Recently updated',
                            selected: true
                        },
                        {
                            value: 'views',
                            text: 'Most views'
                        },
                        {
                            value: 'comments',
                            text: 'Most comments'
                        }
                    ]
                },
                pageTitle: ''
            };

            expect(result).toEqual(expected);
        });
    });
});
