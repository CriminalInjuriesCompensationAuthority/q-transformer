'use strict';

const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');
const govukSelectTransformer = require('../lib/transformers/govukSelect');
const answerFormatHelper = require('../lib/helpers/answerHelper');

const {removeIndentation} = require('./schema-string-helper');

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
                            macroOptions: {
                                autocomplete: true
                            }
                        }
                    }
                }
            }
        },
        'p--check-your-answers': {
            options: {
                isSummary: true,
                buttonText: 'Agree and Submit',
                properties: {
                    'p-check-your-answers': {
                        options: {
                            summaryStructure: [
                                {
                                    title: 'Your details',
                                    questions: {
                                        'p-applicant-enter-your-name': 'Name',

                                        'p-applicant-have-you-been-known-by-any-other-names':
                                            'Have you been known by any other names?',
                                        'p-applicant-what-other-names-have-you-used': 'Other names',
                                        'p-applicant-enter-your-date-of-birth': 'Date of birth',
                                        'p-applicant-enter-your-email-address': 'Email address',
                                        'p-applicant-enter-your-address': 'Address',
                                        'p-applicant-enter-your-telephone-number':
                                            'Telephone Number',

                                        'p-applicant-british-citizen-or-eu-national':
                                            'Are you a British citizen or EU National?',
                                        'p-applicant-are-you-18-or-over': 'Are you 18 or over?',

                                        'p-applicant-who-are-you-applying-for':
                                            'Who are you applying for?',
                                        'p-applicant-were-you-a-victim-of-sexual-assault-or-abuse':
                                            'Were you a victim of sexual assault or abuse?',
                                        'p-applicant-select-the-option-that-applies-to-you':
                                            "Option you've selected"
                                    }
                                },
                                {
                                    title: 'About the crime',
                                    questions: {
                                        'p-applicant-did-the-crime-happen-once-or-over-time':
                                            'Did the crime happen once or over a period of time?',
                                        'p-applicant-when-did-the-crime-happen':
                                            'When did the crime happen?',
                                        'p-applicant-when-did-the-crime-start':
                                            'When did the crime start?',
                                        'p-applicant-when-did-the-crime-stop':
                                            'When did the crime stop?',
                                        'p-applicant-select-reasons-for-the-delay-in-making-your-application':
                                            'Reasons for the delay in making your application',
                                        'p-applicant-where-did-the-crime-happen':
                                            'Where did the crime happen?',
                                        'p-applicant-where-in-england-did-it-happen':
                                            'Where in England did it happen?',
                                        'p-applicant-where-in-scotland-did-it-happen':
                                            'Where in Scotland did it happen?',
                                        'p-applicant-where-in-wales-did-it-happen':
                                            'Where in Wales did it happen?',
                                        'p-offender-do-you-know-the-name-of-the-offender':
                                            'Do you know the name of the offender?',
                                        'p-offender-enter-offenders-name': "Offender's name",

                                        'p-offender-describe-contact-with-offender':
                                            'Contact with offender'
                                    }
                                },
                                {
                                    title: 'Police report',
                                    questions: {
                                        'p--was-the-crime-reported-to-police':
                                            'Was the crime reported to police?',
                                        'p--when-was-the-crime-reported-to-police':
                                            'When was the crime reported?',
                                        'p--whats-the-crime-reference-number':
                                            'Crime reference number',
                                        'p--which-english-police-force-is-investigating-the-crime':
                                            'Which police force is investigating?',
                                        'p--which-police-scotland-division-is-investigating-the-crime':
                                            'Which police force is investigating?',
                                        'p--which-welsh-police-force-is-investigating-the-crime':
                                            'Which police force is investigating?',
                                        'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police':
                                            'Reasons for delay in reporting crime'
                                    }
                                },
                                {
                                    title: 'Other compensation',
                                    questions: {
                                        'p-applicant-have-you-applied-to-us-before':
                                            'Have you applied before?',
                                        'p-applicant-have-you-applied-for-or-received-any-other-compensation':
                                            'Have you received other compensation?',
                                        'p-applicant-other-compensation-details':
                                            'Details of other compensation received'
                                    }
                                }
                            ],
                            lookup: {
                                true: 'Yes',
                                false: 'No',
                                once: 'Once',
                                'over-a-period-of-time': 'Over a period of time',
                                'i-was-underage': 'I was under 18',
                                'i-was-advised-to-wait': 'I was advised to wait',
                                'medical-reasons': 'Medical reasons',
                                'other-reasons': 'Other reasons',
                                'i-was-under-18': 'I was under 18',
                                'unable-to-report-crime': 'Unable to report the crime',
                                other: 'Other reasons',
                                'option-1:-sexual-assault-or-abuse':
                                    'Option 1: Sexual assault or abuse',
                                'option-2:-sexual-assault-or-abuse-and-other-injuries-or-losses':
                                    'Option 2: Sexual assault or abuse and other injuries or losses',
                                myself: 'Myself',
                                'someone-else': 'Someone else',
                                england: 'England',
                                scotland: 'Scotland',
                                wales: 'Wales',
                                'somewhere-else': 'Somewhere else',
                                'i-have-no-contact-with-the-offender':
                                    'I have no contact with the offender',
                                10000033: 'Avon And Somerset Constabulary',
                                10000035: 'Bedfordshire Police',
                                10000001: 'British Transport Police',
                                10000039: 'Cambridgeshire Constabulary',
                                10000049: 'Cheshire Constabulary',
                                10000059: 'City Of London Police',
                                10000066: 'Cleveland Police',
                                10000082: 'Cumbria Constabulary',
                                10000084: 'Derbyshire Constabulary',
                                10000090: 'Devon & Cornwall Constabulary',
                                10000093: 'Dorset Police',
                                10000102: 'Durham Constabulary',
                                10000109: 'Dyfed Powys Police',
                                10000114: 'Essex Police',
                                10000128: 'Gloucestershire Constabulary',
                                10000140: 'Greater Manchester Police',
                                10000147: 'Gwent Constabulary',
                                10000150: 'Hampshire Constabulary',
                                10000153: 'Hertfordshire Constabulary',
                                10000169: 'Humberside Police',
                                10000172: 'Kent County Constabulary',
                                10000175: 'Lancashire Constabulary',
                                10000176: 'Leicestershire Police',
                                10000179: 'Lincolnshire Police',
                                10000181: 'Merseyside Police',
                                11809785: 'Metropolitan Barking',
                                11809719: 'Metropolitan Barnet',
                                11809788: 'Metropolitan Bexley',
                                11809722: 'Metropolitan Brent',
                                11809760: 'Metropolitan Bromley',
                                11809694: 'Metropolitan Camden',
                                11809713: 'Metropolitan Croydon',
                                11809743: 'Metropolitan Ealing',
                                11809783: 'Metropolitan Enfield',
                                11809709: 'Metropolitan Greenwich',
                                11809763: 'Metropolitan Hackney',
                                11809795: 'Metropolitan Hammersmith',
                                11809738: 'Metropolitan Haringey',
                                11809803: 'Metropolitan Harrow',
                                11809800: 'Metropolitan Havering',
                                11809775: 'Metropolitan Hillingdon',
                                11809780: 'Metropolitan Hounslow',
                                11809765: 'Metropolitan Islington',
                                11809801: 'Metropolitan Kensington',
                                11809865: 'Metropolitan Kingston',
                                11809693: 'Metropolitan Lambeth',
                                11809698: 'Metropolitan Lewisham',
                                11809861: 'Metropolitan Merton',
                                11809701: 'Metropolitan Newham',
                                11809782: 'Metropolitan Redbridge',
                                11809862: 'Metropolitan Richmond',
                                11809691: 'Metropolitan Southwark',
                                11809805: 'Metropolitan Sutton',
                                11809767: 'Metropolitan Tower Hamlets',
                                11809726: 'Metropolitan Waltham Forest',
                                11809771: 'Metropolitan Wandsworth',
                                11809683: 'Metropolitan Westminster',
                                10000185: 'Norfolk Constabulary',
                                10000187: 'North Wales Police',
                                10000189: 'North Yorkshire Police',
                                10000191: 'Northamptonshire Police',
                                10000195: 'Northumbria Police',
                                10000199: 'Nottinghamshire Police',
                                12607027: 'Scotland Argyll/West Dunbartonshire',
                                12157147: 'Scotland Ayrshire',
                                10000098: 'Scotland Dumfries & Galloway',
                                13400412: 'Scotland Edinburgh City',
                                10002424: 'Scotland Fife',
                                10000045: 'Scotland Forth Valley',
                                12607023: 'Scotland Greater Glasgow',
                                10000193: 'Scotland Highlands And Islands',
                                12607028: 'Scotland Lanarkshire',
                                13400413: 'Scotland Lothian And Borders',
                                10000133: 'Scotland North East',
                                12607026: 'Scotland Renfrewshire/Inverclyde',
                                10000243: 'Scotland Tayside',
                                10000215: 'South Wales Police',
                                10000218: 'South Yorkshire Police',
                                10000223: 'Staffordshire Police',
                                10000233: 'Suffolk Constabulary',
                                10000237: 'Surrey Constabulary',
                                10000240: 'Sussex Police',
                                10000247: 'Thames Valley Police',
                                10000274: 'Warwickshire Constabulary',
                                10000279: 'West Mercia Police',
                                10000285: 'West Midlands Police',
                                10000291: 'West Yorkshire Police',
                                10000295: 'Wiltshire Constabulary'
                            }
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
                    'q-applicant-select-reasons-for-the-delay-in-making-your-application',
                    'q-applicant-explain-reason-for-delay-application'
                ]
            }
        },
        'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police': {
            options: {
                outputOrder: [
                    'q-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police',
                    'q-applicant-explain-reason-for-delay-reporting'
                ]
            }
        },
        'p-applicant-select-the-option-that-applies-to-you': {
            options: {
                outputOrder: ['applicant-your-choices', 'q-applicant-option'],
                properties: {
                    'q-applicant-option': {
                        options: {
                            macroOptions: {
                                fieldset: {
                                    legend: {
                                        classes: 'govuk-fieldset__legend--m'
                                    }
                                }
                            }
                        }
                    }
                }
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
        },
        'p--confirmation': {
            options: {
                showBackButton: false
            }
        },
        'p-applicant-you-cannot-get-compensation': {
            options: {
                buttonText: 'Continue anyway'
            }
        },
        'p--which-english-police-force-is-investigating-the-crime': {
            options: {
                properties: {
                    'q--which-english-police-force-is-investigating-the-crime': {
                        options: {
                            defaultItem: {
                                value: '',
                                text: 'Select police force'
                            }
                        }
                    }
                }
            }
        },
        'p-applicant-enter-your-email-address': {
            options: {
                properties: {
                    'q-applicant-enter-your-email-address': {
                        options: {
                            macroOptions: {
                                autocomplete: 'email',
                                attributes: {
                                    spellcheck: 'false'
                                }
                            }
                        }
                    }
                }
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
        describe('Given a JSON schema with only a description with nunjuck instruction', () => {
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

        describe('Given a JSON schema with only a description with nunjuck no instruction', () => {
            it('should return a raw content with no instruction', () => {
                const result = qTransformer.transform({
                    schemaKey: 'declaration',
                    schema: {
                        description: `
                            <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        `
                    },
                    uiSchema: {}
                });

                const expected = {
                    id: 'declaration',
                    dependencies: [],
                    componentName: 'rawContent',
                    content: `
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
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
                                    macroOptions: {
                                        autocomplete: 'street-address'
                                    }
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
                it('should convert it to a govukCharacterCount instruction', () => {
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
                        dependencies: [
                            '{% from "character-count/macro.njk" import govukCharacterCount %}'
                        ],
                        componentName: 'govukCharacterCount',
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
                            maxlength: 500
                        }
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
                                    macroOptions: {
                                        autocomplete: 'street-address'
                                    }
                                }
                            }
                        }
                    });

                    const expected = {
                        id: 'more-detail',
                        dependencies: [
                            '{% from "character-count/macro.njk" import govukCharacterCount %}'
                        ],
                        componentName: 'govukCharacterCount',
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
                            autocomplete: 'street-address',
                            maxlength: 500
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
                                    name: 'passport-issued[day]',
                                    id: 'passport-issued[day]',
                                    attributes: {
                                        maxlength: '2'
                                    }
                                },
                                {
                                    label: 'Month',
                                    classes: 'govuk-input--width-2',
                                    name: 'passport-issued[month]',
                                    id: 'passport-issued[month]',
                                    attributes: {
                                        maxlength: '2'
                                    }
                                },
                                {
                                    label: 'Year',
                                    classes: 'govuk-input--width-4',
                                    name: 'passport-issued[year]',
                                    id: 'passport-issued[year]',
                                    attributes: {
                                        maxlength: '4'
                                    }
                                }
                            ]
                        }
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
                                    macroOptions: {
                                        autocomplete: 'bday'
                                    }
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
                                    id: 'passport-issued[day]',
                                    autocomplete: 'bday-day',
                                    attributes: {
                                        maxlength: '2'
                                    }
                                },
                                {
                                    label: 'Month',
                                    classes: 'govuk-input--width-2',
                                    name: 'passport-issued[month]',
                                    id: 'passport-issued[month]',
                                    autocomplete: 'bday-month',
                                    attributes: {
                                        maxlength: '2'
                                    }
                                },
                                {
                                    label: 'Year',
                                    classes: 'govuk-input--width-4',
                                    name: 'passport-issued[year]',
                                    id: 'passport-issued[year]',
                                    autocomplete: 'bday-year',
                                    attributes: {
                                        maxlength: '4'
                                    }
                                }
                            ]
                        }
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
                            id: 'where-do-you-live',
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
                        }
                    };

                    expect(result).toEqual(expected);
                });
            });

            describe('And a const attribute', () => {
                it('should convert it to a govukCheckbox instruction', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'q-applicant-declaration',
                        schema: {
                            type: 'string',
                            title:
                                'I have read and understood the <a href="#declaration" class="govuk-link">information and declaration</a>',
                            const: 'i-agree'
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        id: 'q-applicant-declaration',
                        dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                        componentName: 'govukCheckboxes',
                        macroOptions: {
                            name: 'q-applicant-declaration',
                            idPrefix: 'q-applicant-declaration',
                            items: [
                                {
                                    value: 'i-agree',
                                    html:
                                        'I have read and understood the <a href="#declaration" class="govuk-link">information and declaration</a>'
                                }
                            ]
                        }
                    };

                    expect(result).toEqual(expected);
                });

                it('should convert it to a govukCheckbox instruction with additional properties', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'q-applicant-declaration',
                        schema: {
                            type: 'string',
                            title:
                                'I have read and understood the <a href="#declaration" class="govuk-link">information and declaration</a>',
                            const: 'i-agree',
                            description: 'this is a description'
                        },
                        uiSchema: {}
                    });

                    const expected = {
                        id: 'q-applicant-declaration',
                        dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                        componentName: 'govukCheckboxes',
                        macroOptions: {
                            name: 'q-applicant-declaration',
                            idPrefix: 'q-applicant-declaration',
                            items: [
                                {
                                    value: 'i-agree',
                                    html:
                                        'I have read and understood the <a href="#declaration" class="govuk-link">information and declaration</a>',
                                    hint: {
                                        text: 'this is a description'
                                    }
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
                                    const: 'mines',
                                    description: 'For example, coal mines'
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
                        idPrefix: 'waste',
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
                                hint: {
                                    text: 'For example, coal mines'
                                }
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

            it('should convert it to a govukCheckboxes instruction with a divider', () => {
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
                                    const: 'mines',
                                    description: 'For example, coal mines'
                                },
                                {
                                    title: 'Farm or agricultural waste',
                                    const: 'farm'
                                }
                            ]
                        }
                    },
                    uiSchema: {
                        waste: {
                            // transformer: 'govukCheckboxes',
                            options: {
                                additionalMapping: [
                                    {
                                        itemType: 'divider',
                                        itemValue: 'or',
                                        itemIndex: 2
                                    }
                                ]
                            }
                        }
                    }
                });

                const expected = {
                    id: 'waste',
                    dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                    componentName: 'govukCheckboxes',
                    macroOptions: {
                        idPrefix: 'waste',
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
                                hint: {
                                    text: 'For example, coal mines'
                                }
                            },
                            {
                                divider: 'or'
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
            describe('And the summaryStructure key is present in summaryInfo', () => {
                describe('And the summaryStructure key is present in summaryInfo', () => {
                    describe('And the summaryStructure is an array of themes', () => {
                        it('should return a govukSummaryList instruction', () => {
                            const result = qTransformer.transform({
                                schemaKey: 'p--check-your-answers',
                                schema: {
                                    type: 'object',
                                    description:
                                        'Check your answers before sending your application',
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
                                    '<h1 class="govuk-heading-l">Check your answers before sending your application</h1>\n<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Enter your name"\n}\n]\n}\n}\n]\n}) }}',
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
                                    description:
                                        'Check your answers before sending your application',
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
                                    '<h1 class="govuk-heading-l">Check your answers before sending your application</h1>\n<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Enter your name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Foo Bar"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Enter your name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-when-did-the-crime-happen?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "When did the crime happen?"\n}\n]\n}\n}\n]\n}) }}',
                                dependencies: [
                                    '{% from "summary-list/macro.njk" import govukSummaryList %}'
                                ],
                                id: 'p--check-your-answers'
                            };

                            expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                        });

                        describe('Given a UI schema has been provided', () => {
                            it('should order govukSummaryList adhereing to the UI schema', () => {
                                const result = qTransformer.transform({
                                    schemaKey: 'p--check-your-answers',
                                    schema: {
                                        type: 'object',
                                        description:
                                            'Check your answers before sending your application',
                                        properties: {
                                            summaryInfo: {
                                                urlPath: 'apply',
                                                editAnswerText: 'Change',
                                                summaryStructure: [
                                                    {
                                                        type: 'theme',
                                                        id: 'foo',
                                                        title: 'Foo',
                                                        values: [
                                                            {
                                                                id: 'q-second',
                                                                type: 'simple',
                                                                label: 'Second',
                                                                value: '2',
                                                                sectionId: 'p-baz',
                                                                theme: 'foo'
                                                            },
                                                            {
                                                                id: 'q-first',
                                                                type: 'simple',
                                                                label: 'First',
                                                                value: '1',
                                                                valueLabel: '1',
                                                                sectionId: 'p-baz',
                                                                theme: 'foo'
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    fullUiSchema: {
                                        'p-baz': {
                                            options: {
                                                transformOrder: ['q-second', 'q-first'],
                                                outputOrder: ['q-first'],
                                                properties: {
                                                    'q-first': {
                                                        options: {
                                                            conditionalComponentMap: [
                                                                {
                                                                    itemValue: '1',
                                                                    componentIds: ['q-second']
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    'q-second': {
                                                        options: {
                                                            macroOptions: {
                                                                classes: 'govuk-input--width-20'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });

                                const qFirst =
                                    '"key": {\n' +
                                    '"text": "First",\n' +
                                    '"classes": "govuk-!-width-one-half"\n' +
                                    '},\n' +
                                    '"value": {\n' +
                                    '"html": "1"\n' +
                                    '},\n' +
                                    '"actions": {\n' +
                                    '"items": [\n' +
                                    '{\n' +
                                    '"href": "/apply/baz?next=info-check-your-answers",\n' +
                                    '"text": "Change",\n' +
                                    '"visuallyHiddenText": "First"\n' +
                                    '}\n' +
                                    ']\n' +
                                    '}\n';
                                const qSecond =
                                    '"key": {\n' +
                                    '"text": "Second",\n' +
                                    '"classes": "govuk-!-width-one-half"\n' +
                                    '},\n' +
                                    '"value": {\n' +
                                    '"html": "2"\n' +
                                    '},\n' +
                                    '"actions": {\n' +
                                    '"items": [\n' +
                                    '{\n' +
                                    '"href": "/apply/baz?next=info-check-your-answers",\n' +
                                    '"text": "Change",\n' +
                                    '"visuallyHiddenText": "Second"\n' +
                                    '}\n' +
                                    ']\n' +
                                    '}\n';
                                const expected = {
                                    componentName: 'summary',
                                    content:
                                        // eslint-disable-next-line prefer-template
                                        '<h1 class="govuk-heading-l">Check your answers before sending your application</h1>\n' +
                                        '<h2 class="govuk-heading-l">Foo</h2>\n' +
                                        '{{ govukSummaryList({\n' +
                                        "classes: 'govuk-!-margin-bottom-9',\n" +
                                        'rows: [\n' +
                                        '{\n' +
                                        qFirst +
                                        '},\n' +
                                        '{\n' +
                                        qSecond +
                                        '}\n' +
                                        ']\n' +
                                        '}) }}',
                                    dependencies: [
                                        '{% from "summary-list/macro.njk" import govukSummaryList %}'
                                    ],
                                    id: 'p--check-your-answers'
                                };

                                expect(removeIndentation(result)).toEqual(
                                    removeIndentation(expected)
                                );
                            });
                        });
                    });

                    const summarySchema = {
                        type: 'object',
                        properties: {
                            summaryInfo: {
                                urlPath: 'apply',
                                editAnswerText: 'Change',
                                footerText: `<h2 class="govuk-heading-l">Agree and submit your application</h2>
                    <p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>
                <p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>`,
                                summaryStructure: [
                                    {
                                        title: 'Your details',
                                        questions: [
                                            {
                                                id: 'p-applicant-enter-your-name',
                                                label: 'Name'
                                            }
                                        ]
                                    },
                                    {
                                        title: 'About the crime',
                                        questions: [
                                            {
                                                id: 'p-applicant-when-did-the-crime-happen',
                                                label: 'When did the crime happen?'
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Other compensation',
                                        questions: [
                                            {
                                                id: 'p-applicant-have-you-applied-to-us-before',
                                                label: 'Have you applied before?'
                                            }
                                        ]
                                    }
                                ],
                                lookup: {
                                    true: 'Yes',
                                    false: 'No'
                                }
                            }
                        }
                    };
                    it('should return a govukSummaryList instruction', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'p--check-your-answers',
                            schema: summarySchema,
                            uiSchema: {},
                            data: {
                                'p-applicant-enter-your-name': {
                                    'q-applicant-title': 'Mr',
                                    'q-applicant-first-name': 'Test',
                                    'q-applicant-last-name': 'McTest'
                                }
                            },
                            fullUiSchema: uiSchema
                        });

                        const expected = {
                            componentName: 'summary',
                            content:
                                '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Test McTest"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
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
                            schema: summarySchema,
                            uiSchema: {},
                            data: {
                                'p-applicant-enter-your-name': {
                                    'q-applicant-last-name': 'McTest',
                                    'q-applicant-first-name': 'Test',
                                    'q-applicant-title': 'Mr'
                                },
                                'p-applicant-when-did-the-crime-happen': {
                                    'q-applicant-when-did-the-crime-happen':
                                        '2019-01-01T09:55:22.130Z'
                                }
                            },
                            fullUiSchema: uiSchema
                        });

                        const expected = {
                            componentName: 'summary',
                            content:
                                '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Test McTest"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-when-did-the-crime-happen?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "When did the crime happen?"\n}\n]\n}\n}\n]\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p--check-your-answers'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });

                    it('should return a govukSummaryList instructions, headings with no answers should not appear', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'p--check-your-answers',
                            schema: summarySchema,
                            uiSchema: {},
                            data: {
                                'p-applicant-enter-your-name': {
                                    'q-applicant-last-name': 'McTest',
                                    'q-applicant-first-name': 'Test',
                                    'q-applicant-title': 'Mr'
                                },
                                'p-applicant-have-you-applied-to-us-before': {
                                    'q-applicant-have-you-applied-to-us-before': 'true'
                                }
                            },
                            fullUiSchema: uiSchema
                        });

                        const expected = {
                            componentName: 'summary',
                            content:
                                '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Test McTest"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">Other compensation</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Have you applied before?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Yes"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-have-you-applied-to-us-before?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Have you applied before?"\n}\n]\n}\n}\n]\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p--check-your-answers'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });

                    it('should return a govukSummaryList in the order defined by the template', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'p--check-your-answers',
                            schema: summarySchema,
                            uiSchema: {},
                            data: {
                                'p-applicant-enter-your-name': {
                                    'q-applicant-last-name': 'McTest',
                                    'q-applicant-first-name': 'Test',
                                    'q-applicant-title': 'Mr'
                                },
                                'p-applicant-when-did-the-crime-happen': {
                                    'q-applicant-when-did-the-crime-happen':
                                        '2019-01-01T09:55:22.130Z'
                                }
                            },
                            fullUiSchema: uiSchema
                        });

                        const expected = {
                            componentName: 'summary',
                            content:
                                '<h2 class="govuk-heading-l">Your details</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "Name",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "Mr Test McTest"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-enter-your-name?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "Name"\n}\n]\n}\n}\n]\n}) }}<h2 class="govuk-heading-l">About the crime</h2>\n{{ govukSummaryList({\nclasses: \'govuk-!-margin-bottom-9\',\nrows: [\n{\n"key": {\n"text": "When did the crime happen?",\n"classes": "govuk-!-width-one-half"\n},\n"value": {\n"html": "01 January 2019"\n},\n"actions": {\n"items": [\n{\n"href": "/apply/applicant-when-did-the-crime-happen?next=check-your-answers",\n"text": "Change",\n"visuallyHiddenText": "When did the crime happen?"\n}\n]\n}\n}\n]\n}) }}\n<h2 class="govuk-heading-l">Agree and submit your application</h2>\n<p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>\n<p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>\n',
                            dependencies: [
                                '{% from "summary-list/macro.njk" import govukSummaryList %}'
                            ],
                            id: 'p--check-your-answers'
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });

                    it('should return a govukSummaryList in the order defined by the template and append answers which are supplied in the body but not defined in the template', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'p-summary',
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
                    pageTitle: 'Email address',
                    hasErrors: false,
                    content: `{% from "input/macro.njk" import govukInput %}
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
                    pageTitle: 'Event name',
                    hasErrors: false,
                    content: removeIndentation(`
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
                        }) }}`)
                };
                expect({
                    pageTitle: result.pageTitle,
                    hasErrors: result.hasErrors,
                    content: removeIndentation(result.content)
                }).toEqual(expected);
            });
        });

        describe('Given a JSON Schema with type:boolean', () => {
            describe('And has two or less options', () => {
                describe('And has options with labels greater than 5 characters', () => {
                    it('should convert it to a vertically aligned govukRadios instruction', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'changed-name',
                            schema: {
                                type: 'boolean',
                                title: 'Have you changed your name?',
                                description:
                                    'This includes changing your last name or spelling your name differently.',
                                oneOf: [
                                    {
                                        title: 'Yes I have',
                                        const: true
                                    },
                                    {
                                        title: 'No I have not',
                                        const: false
                                    }
                                ]
                            },
                            uiSchema: {}
                        });

                        const expected = {
                            id: 'changed-name',
                            dependencies: ['{% from "radios/macro.njk" import govukRadios %}'],
                            componentName: 'govukRadios',
                            macroOptions: {
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
                                        text: 'Yes I have'
                                    },
                                    {
                                        value: false,
                                        text: 'No I have not'
                                    }
                                ]
                            }
                        };

                        expect(result).toEqual(expected);
                    });
                });
                describe('And has options with short labels', () => {
                    it('should convert it to a horizontally aligned govukRadios instruction', () => {
                        const result = qTransformer.transform({
                            schemaKey: 'changed-name',
                            schema: {
                                type: 'boolean',
                                title: 'Have you changed your name?',
                                description:
                                    'This includes changing your last name or spelling your name differently.',
                                oneOf: [
                                    {
                                        title: 'Yes',
                                        const: true
                                    },
                                    {
                                        title: 'No',
                                        const: false
                                    }
                                ]
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
        });
    });

    describe('Conditional content', () => {
        describe('Given a JSON Schema with type:object', () => {
            describe('And a uiSchema with a "conditionalComponents" attribute', () => {
                describe('And given a radio button subSchema', () => {
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `
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
                            pageTitle: 'How would you prefer to be contacted?',
                            content: `
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
                        expect(result.content.replace(/\s+/g, '')).toEqual(
                            expected.content.replace(/\s+/g, '')
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `{% from "input/macro.njk" import govukInput %}
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
                                ],
                                "classes": "govuk-radios--inline"
                            }) }}`
                        };

                        expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                    });
                });
                describe('And given a checkbox subSchema', () => {
                    it('should convert it to a govukCheckboxes with conditional content', () => {
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
                                        type: 'array',
                                        items: {
                                            anyOf: [
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
                                        }
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
                                                contact: {
                                                    contains: {
                                                        const: 'email'
                                                    }
                                                }
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
                                                contact: {
                                                    contains: {
                                                        const: 'phone'
                                                    }
                                                }
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
                                                contact: {
                                                    contains: {
                                                        const: 'text'
                                                    }
                                                }
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `
                            {% from "input/macro.njk" import govukInput %}
                            {% from "checkboxes/macro.njk" import govukCheckboxes %}
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
                            }) }}{% endset -%}{{ govukCheckboxes({
                                "idPrefix": "contact",
                                "name": "contact[]",
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

                    it('should convert it to a govukCheckboxes with multiple conditional content', () => {
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
                                        type: 'array',
                                        items: {
                                            anyOf: [
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
                                        }
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
                            pageTitle: 'How would you prefer to be contacted?',
                            content: `
                            {% from "input/macro.njk" import govukInput %}
                            {% from "checkboxes/macro.njk" import govukCheckboxes %}
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
                            }) }}{% endset -%}{{ govukCheckboxes({
                                "idPrefix": "contact",
                                "name": "contact[]",
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
                        expect(result.content.replace(/\s+/g, '')).toEqual(
                            expected.content.replace(/\s+/g, '')
                        );
                    });

                    it('should convert it to a govukCheckboxes with properly escaped user answers', () => {
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
                                        type: 'array',
                                        items: {
                                            anyOf: [
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
                                        }
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
                                                contact: {
                                                    contains: {const: 'email'}
                                                }
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
                                                contact: {
                                                    contains: {const: 'phone'}
                                                }
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
                                                contact: {
                                                    contains: {const: 'text'}
                                                }
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `
                        {% from "input/macro.njk" import govukInput %}
                        {% from "checkboxes/macro.njk" import govukCheckboxes %}
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
                        }) }}{% endset -%}{{ govukCheckboxes({
                            "idPrefix": "contact",
                            "name": "contact[]",
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
                                        type: 'array',
                                        items: {
                                            anyOf: [
                                                {
                                                    title: 'Email',
                                                    const: 'email'
                                                }
                                            ]
                                        }
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
                                                contact: {
                                                    contains: {const: 'email'}
                                                }
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
                            pageTitle: 'How would you prefer to be contacted?',
                            hasErrors: false,
                            content: `{% from "input/macro.njk" import govukInput %}
                            {% from "checkboxes/macro.njk" import govukCheckboxes %}
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
                            }) }}{% endset -%}{{ govukCheckboxes({
                                "idPrefix": "contact",
                                "name": "contact[]",
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
                pageTitle: 'Email address',
                hasErrors: false,
                content: `{% from "input/macro.njk" import govukInput %}
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
                    waste: ['mines', 'farm']
                }
            });

            const expected = {
                id: 'waste',
                dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                componentName: 'govukCheckboxes',
                macroOptions: {
                    idPrefix: 'waste',
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

        it('should pre-populate a govukCharacterCount instruction', () => {
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
                dependencies: ['{% from "character-count/macro.njk" import govukCharacterCount %}'],
                componentName: 'govukCharacterCount',
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
                    value: 'Peppa Pig',
                    maxlength: 500
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
                            id: 'passport-issued[day]',
                            value: 1,
                            attributes: {
                                maxlength: '2'
                            }
                        },
                        {
                            label: 'Month',
                            classes: 'govuk-input--width-2',
                            name: 'passport-issued[month]',
                            id: 'passport-issued[month]',
                            value: 2,
                            attributes: {
                                maxlength: '2'
                            }
                        },
                        {
                            label: 'Year',
                            classes: 'govuk-input--width-4',
                            name: 'passport-issued[year]',
                            id: 'passport-issued[year]',
                            value: 1980,
                            attributes: {
                                maxlength: '4'
                            }
                        }
                    ]
                }
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
                    id: 'sort',
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
                }
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
                    id: 'sort',
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
                errorSummaryHREF: '#event-name[day]',
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
                            id: 'event-name[day]',
                            value: 0,
                            attributes: {
                                maxlength: '2'
                            }
                        },
                        {
                            label: 'Month',
                            classes: 'govuk-input--width-2 govuk-input--error',
                            name: 'event-name[month]',
                            id: 'event-name[month]',
                            value: 0,
                            attributes: {
                                maxlength: '2'
                            }
                        },
                        {
                            label: 'Year',
                            classes: 'govuk-input--width-4 govuk-input--error',
                            name: 'event-name[year]',
                            id: 'event-name[year]',
                            value: 0,
                            attributes: {
                                maxlength: '4'
                            }
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
                errorSummaryHREF: '#waste[]',
                dependencies: ['{% from "checkboxes/macro.njk" import govukCheckboxes %}'],
                componentName: 'govukCheckboxes',
                macroOptions: {
                    idPrefix: 'waste',
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
                        'This includes changing your last name or spelling your name differently.',
                    oneOf: [
                        {
                            title: 'Yes',
                            const: true
                        },
                        {
                            title: 'No',
                            const: false
                        }
                    ]
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
                }
            };

            expect(result).toEqual(expected);
        });

        it('should display errors for govukCharacterCount instruction', () => {
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
                dependencies: ['{% from "character-count/macro.njk" import govukCharacterCount %}'],
                componentName: 'govukCharacterCount',
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
                    value: 123,
                    maxlength: 500
                }
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
                pageTitle: 'Email address',
                hasErrors: true,
                content: removeIndentation(`
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
                    `)
            };

            expect({
                pageTitle: result.pageTitle,
                hasErrors: result.hasErrors,
                content: removeIndentation(result.content)
            }).toEqual(expected);
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
                    id: 'where-do-you-live',
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
                }
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
                }
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
                }
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
                }
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
                pageTitle: 'Email address',
                content: `
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
            expect(result.content.replace(/\s+/g, '')).toEqual(
                expected.content.replace(/\s+/g, '')
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
                            'q-applicant-first-name': 'Test',
                            'q-applicant-last-name': 'McTest'
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

                it('should format all true/false answers to "Yes" or "No"', () => {
                    const answerValues = [];
                    // eslint-disable-next-line no-restricted-syntax
                    for (const answer in formattedAnswer) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (formattedAnswer.hasOwnProperty(answer)) {
                            answerValues.push(formattedAnswer[answer]);
                        }
                    }

                    expect(answerValues).not.toContain('true');
                    expect(answerValues).not.toContain('false');
                    expect(answerValues).toContain('Yes');
                    expect(answerValues).toContain('No');
                });

                it('should format a question with more than one but less than 4 answers on a single line', () => {
                    expect(formattedAnswer['p-applicant-enter-your-name']).toMatch(
                        'Mr Test McTest'
                    );
                });

                it('should format a question with 4 or more answers appears in a multi-line format', () => {
                    expect(formattedAnswer['p-applicant-enter-your-address']).toMatch(
                        'Alexander Bain House<br>Atlantic Quay<br>Glasgow<br>G2 8JQ'
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
                describe('returnPartialDate', () => {
                    it('Should return the month and year only, given a valid date', () => {
                        const fullDate = '2019-10-05T14:48:00.000Z';

                        const actual = answerFormatHelper.returnPartialDate(fullDate);

                        expect(actual).toEqual('October 2019');
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
            describe('objectFormatter', () => {
                const helper = answerFormatHelper;
                describe('Given an an array', () => {
                    it('should parse into a string with line breaks between items', () => {
                        const obj = ['foo', 'bar'];

                        const actual = helper.objectFormatter(obj);
                        const expected = 'foo<br>bar';

                        expect(expected).toMatch(actual);
                    });
                });
                describe('Given an an object', () => {
                    describe('With 3 or less keys', () => {
                        it('should parse into a string with spaces between values', () => {
                            const obj = {
                                a: 'foo',
                                b: 'bar',
                                c: 'biz'
                            };

                            const actual = helper.objectFormatter(obj);
                            const expected = 'foo bar biz';

                            expect(expected).toMatch(actual);
                        });
                    });
                    describe('With more than 3 keys', () => {
                        it('should parse into a string with line breaks between values', () => {
                            const obj = {
                                a: 'foo',
                                b: 'bar',
                                c: 'biz',
                                d: 'baz'
                            };

                            const actual = helper.objectFormatter(obj);
                            const expected = 'foo<br>bar<br>biz<br>baz';

                            expect(expected).toMatch(actual);
                        });
                    });
                    describe('With a "yes" or "no" value', () => {
                        it('should append a comma and a space to the value', () => {
                            const obj = {
                                a: 'Yes',
                                b: 'foo',
                                c: 'bar'
                            };

                            const actual = helper.objectFormatter(obj);
                            const expected = 'Yes, foo bar';

                            expect(expected).toMatch(actual);
                        });
                    });
                });
            });
            describe('dateFormatterV2', () => {
                const helper = answerFormatHelper;
                it('should format a date in a specified format', () => {
                    const date = '2021-01-01T00:00:00.000Z';
                    const format = {
                        value: 'date-time',
                        precision: 'MMMM YYYY'
                    };

                    const actual = helper.formatAnswerV2(date, format);
                    const expected = 'January 2021';

                    expect(expected).toMatch(actual);
                });
            });
            describe('parseDateFormat', () => {
                const helper = answerFormatHelper;

                describe('Given any other format', () => {
                    it('should parse into a user readable date format', () => {
                        const precision = 'YY-MM';

                        const actual = helper.parseDateFormat(precision);
                        const expected = 'MMMM YYYY';

                        expect(expected).toMatch(actual);
                    });
                });

                describe('Given a format with a day part', () => {
                    it('should parse into a user readable date format', () => {
                        const precision = 'YY/MM DDD';

                        const actual = helper.parseDateFormat(precision);
                        const expected = 'DD MMMM YYYY';

                        expect(expected).toMatch(actual);
                    });
                });
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
                    id: 'sort',
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
                }
            };

            expect(result).toEqual(expected);
        });
    });

    describe('Additional content', () => {
        describe('Given a JSON Schema with type:object', () => {
            describe('And a uiSchema with a "additionalMapping" attribute', () => {
                it('should convert it to a govukRadios with additional content at the correct index', () => {
                    const result = qTransformer.transform({
                        schemaKey: 'p-some-id',
                        schema: {
                            type: 'object',
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
                                }
                            },
                            required: ['contact']
                        },
                        uiSchema: {
                            'p-some-id': {
                                // transformer: 'form',
                                options: {
                                    properties: {
                                        contact: {
                                            // transformer: 'govukRadios',
                                            options: {
                                                additionalMapping: [
                                                    {
                                                        itemType: 'divider',
                                                        itemValue: 'or',
                                                        itemIndex: 2
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
                        pageTitle: 'How would you prefer to be contacted?',
                        hasErrors: false,
                        content: `
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
                                        "text": "Email"
                                    },
                                    {
                                        "value": "phone",
                                        "text": "Phone"
                                    },
                                    {
                                        "divider": "or"
                                    },
                                    {
                                        "value": "text",
                                        "text": "Text message"
                                    }
                                ]
                            }) }}`
                    };

                    expect(removeIndentation(result)).toEqual(removeIndentation(expected));
                });
            });
        });
    });

    describe('Display page title', () => {
        describe('Schema has a page level title', () => {
            it('Should display a page level title', () => {
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
                    pageTitle: 'Event name',
                    hasErrors: false,
                    content: removeIndentation(`
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
                        }) }}`)
                };
                expect({
                    pageTitle: result.pageTitle,
                    hasErrors: result.hasErrors,
                    content: removeIndentation(result.content)
                }).toEqual(expected);
            });
        });
        describe('Schema has no page level title', () => {
            it('Should display the title of the first property', () => {
                const result = qTransformer.transform({
                    schemaKey: 'event-name',
                    schema: {
                        type: 'object',
                        propertyNames: {
                            enum: ['email']
                        },
                        properties: {
                            declaration: {
                                title: 'declaration',
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
                    pageTitle: 'declaration',
                    hasErrors: false,
                    content: removeIndentation(`
                        {% from "warning-text/macro.njk" import govukWarningText %}
                        <h1 class="govuk-heading-xl">declaration</h1>
                        <p><strong>By continuing you confirm that the information you will give is true as far as you know.</strong></p>
                        {{ govukWarningText({
                            text: "You could be prosecuted or get less compensation if you give false or misleading information."
                        }) }}`)
                };
                expect({
                    pageTitle: result.pageTitle,
                    hasErrors: result.hasErrors,
                    content: removeIndentation(result.content)
                }).toEqual(expected);
            });
        });
    });
});
