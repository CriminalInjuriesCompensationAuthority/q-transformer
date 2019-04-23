const merge = require('lodash.merge');

const summaryStructure = [
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
            'p--which-english-police-force-is-investigating-the-crime',
            'p--which-police-scotland-division-is-investigating-the-crime',
            'p--which-welsh-police-force-is-investigating-the-crime',
            'p--when-was-the-crime-reported-to-police',
            'p-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police',
            'p--whats-the-crime-reference-number'
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
];

module.exports = ({schemaKey, schema, options, data} = {}) => {
    let summaryLists = '';

    summaryStructure.forEach(summaryList => {
        const rows = [];
        summaryList.questions.forEach(question => {
            if (data[question]) {
                const row = {
                    key: {
                        text: schema.displayName
                    },
                    value: {
                        text: data[question].value
                    },
                    actions: {
                        items: [
                            {
                                href: data[question].href,
                                text: 'Change',
                                visuallyHiddenText: schema.displayName
                            }
                        ]
                    }
                };

                rows.push(row);
            }
        });
        summaryLists += `<h2 class="govuk-heading-l">${summaryList.title}</h2>
              {{ govukSummaryList({
                classes: 'govuk-!-margin-bottom-9',
                rows: ${JSON.stringify(rows)}
              }) }}`;
    });

    const summaryContent = `
              ${summaryLists}
              <h2 class="govuk-heading-l">Agree and submit your application</h2>
              <p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>
              <p class="govuk-body">To find out more about how we handle your data <a class="govuk-body" href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>
          `;
    const opts = merge(
        {
            id: schemaKey,
            dependencies: [],
            componentName: 'summary',
            content: summaryContent
        },
        options
    );

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        content: opts.content
    };
};
