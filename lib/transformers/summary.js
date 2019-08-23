const merge = require('lodash.merge');
const answerHelper = require('../helpers/answerHelper');

module.exports = ({schemaKey, schema, options, data, questionnaireUISchema} = {}) => {
    const {summaryStructure} = options;
    const answers = answerHelper.summaryFormatter(data, questionnaireUISchema);
    let summaryLists = '';
    summaryStructure.forEach(summaryList => {
        const rows = [];
        summaryList.questions.forEach(question => {
            if (answers[question]) {
                const row = {
                    key: {
                        text: schema.summaryInfo[question].displayName,
                        classes: 'govuk-!-width-one-half'
                    },
                    value: {
                        html: answers[question].value
                    },
                    actions: {
                        items: [
                            {
                                href: answers[question].href,
                                text: 'Change',
                                visuallyHiddenText: schema.summaryInfo[question].displayName
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
                rows: ${JSON.stringify(rows, null, 4)}
              }) }}`;
    });

    const summaryContent = `
              ${summaryLists}
              <h2 class="govuk-heading-l">Agree and submit your application</h2>
              <p class="govuk-body">By submitting this application you agree that we can share the details in it with the police. This helps us get the police information that we need to make a decision.</p>
              <p class="govuk-body">To find out more about how we handle your data <a href="https://www.gov.uk/guidance/cica-privacy-notice" target="">read our privacy notice</a>.</p>
          `;
    const opts = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
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
