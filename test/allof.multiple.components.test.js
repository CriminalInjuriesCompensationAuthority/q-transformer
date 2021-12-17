const createQTransformer = require('../lib/q-transformer');
const defaultTransformer = require('../lib/transformers/default');

const textInputSchema = require('./fixtures/allof/textInputSchema');
const textInputSchemaExpectedContent = require('./fixtures/allof/textInputSchemaExpectedContent');

const enterYourNameExpectedContent = require('./fixtures/allof/enterYourNameExpectedContent');
const applicantNameSchema = require('./fixtures/allof/enterYourNameSchema');

const textAndCompositeAllOfSchemaExpectedContent = require('./fixtures/allof/textAndCompositeAllOfSchemaExpectedContent');
const textAndCompositeAllOfSchema = require('./fixtures/allof/textAndCompositeAllOfSchema');

const textAndRadioSchemasExpectedContent = require('./fixtures/allof/textAndRadioSchemaExpectedContent');
const textAndRadioAllOfSchema = require('./fixtures/allof/textAndRadioAllOfSchema');

const radioButtonSchema = require('./fixtures/allof/radioButtonSchema');
const radioButtonSchemaExpectedContent = require('./fixtures/allof/radioButtonSchemaExpectedContent');

const twoCompositeAllOfSchema = require('./fixtures/allof/twoCompositeAllOfSchema');
const twoCompositeAllOfExpectedContent = require('./fixtures/allof/twoCompositeAllOfSchemaExpectedContent');

const radioWithInfoAndCompositeAllOfSchema = require('./fixtures/allof/radioWithInfoAndCompositeAllOfSchema');
const radioWithInfoAndCompositeExpectedContent = require('./fixtures/allof/radioWithInfoAndCompositeAllOfSchemaExpectedContent');

const passportDetailsSchema = require('./fixtures/allof/passportDetailsSchema');
const passportDetailsExpectedContent = require('./fixtures/allof/passportDetailsExpectedContent');

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

describe('allOf', () => {
    let qTransformer;

    beforeEach(() => {
        qTransformer = createQTransformer({
            default: defaultTransformer
        });
    });

    describe('Defaults', () => {
        describe('Given a JSON Schema with type:object', () => {
            describe('For text input And no "allOf" keyword is present', () => {
                it('should render a component for one text input', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(textInputSchema)
                    );
                    const expectedContent = removeIndentation(textInputSchemaExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render a component for one radio button component', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(radioButtonSchema)
                    );
                    const expectedContent = removeIndentation(radioButtonSchemaExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
            });
            describe('And the "allOf" keyword is present with no "properties" keyword', () => {
                it('should render content for one schema within allOf', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(applicantNameSchema)
                    );
                    const expectedContent = removeIndentation(enterYourNameExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render content for two schema within allOf, one text, one composite', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(textAndCompositeAllOfSchema)
                    );
                    const expectedContent = removeIndentation(
                        textAndCompositeAllOfSchemaExpectedContent
                    );
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render content for two schema within allOf, one text, one radio', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(textAndRadioAllOfSchema)
                    );
                    const expectedContent = removeIndentation(textAndRadioSchemasExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render content for two schema within allOf, two composite', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(twoCompositeAllOfSchema)
                    );
                    const expectedContent = removeIndentation(twoCompositeAllOfExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render content for two schema, passport details, text, date, within allOf', () => {
                    const uiSchema = {
                        'p--was-the-crime-reported-to-police': {
                            options: {
                                properties: {
                                    'q-passport-number': {
                                        options: {
                                            macroOptions: {
                                                label: {
                                                    classes: 'govuk-label--m'
                                                }
                                            }
                                        }
                                    },
                                    'q-expiry-date': {
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
                        }
                    };
                    const {schema} = passportDetailsSchema;
                    const {schemaKey} = passportDetailsSchema;
                    const transformedSchema = removeIndentation(
                        qTransformer.transform({
                            schemaKey,
                            schema,
                            uiSchema
                        })
                    );
                    const expectedContent = removeIndentation(passportDetailsExpectedContent);
                    expect(transformedSchema).toEqual(expectedContent);
                });
                it('should render content with correct ordering for two schema within allOf, one radio with info in the wrong order, one composite', () => {
                    const transformedSchema = removeIndentation(
                        qTransformer.transform(radioWithInfoAndCompositeAllOfSchema)
                    );
                    const expectedContent = removeIndentation(
                        radioWithInfoAndCompositeExpectedContent
                    );
                    expect(transformedSchema).toEqual(expectedContent);
                });
            });
        });
    });
});
