const merge = require('lodash.merge');
const answerHelper = require('../helpers/answerHelper');

function removeSectionIdPrefix(sectionId) {
    if (sectionId.startsWith('p--')) {
        return sectionId.replace(/^p--/, 'info-');
    }
    if (sectionId === 'p-check-your-answers') {
        return sectionId.replace('p-', 'info-');
    }
    return sectionId.replace(/^p-/, '');
}

module.exports = ({schemaKey, schema, options, data, fullUiSchema} = {}) => {
    const {
        summaryStructure,
        lookup,
        footerText,
        urlPath,
        editAnswerText
    } = schema.properties.summaryInfo;
    const answers = answerHelper.summaryFormatter(data, fullUiSchema, lookup);
    let summaryLists = '';
    summaryStructure.forEach(summarySection => {
        const questions = [];
        // For each question in the structure
        summarySection.questions.forEach(question => {
            // If the ID exists in the answers
            if (Object.keys(answers).includes(question.id)) {
                // Push a summary-shaped nunjucks object into the array
                questions.push({
                    key: {
                        text: question.label,
                        classes: 'govuk-!-width-one-half'
                    },
                    value: {
                        html: answers[question.id]
                    },
                    actions: {
                        items: [
                            {
                                href: `/${urlPath}/${removeSectionIdPrefix(
                                    question.id
                                )}?next=${removeSectionIdPrefix(schemaKey)}`,
                                text: editAnswerText,
                                visuallyHiddenText: question.label
                            }
                        ]
                    }
                });
            }
            // Else ignore it.
        });
        // If any questions were found
        if (questions.length > 0) {
            // Complete the govukSummaryList object by including a class. Section title also added here.
            summaryLists += `<h2 class="govuk-heading-l">${summarySection.title}</h2>
              {{ govukSummaryList({
                classes: 'govuk-!-margin-bottom-9',
                rows: ${JSON.stringify(questions, null, 4)}
              }) }}`;
        }
    });

    const summaryContent = footerText
        ? `
              ${summaryLists}
              ${footerText}
          `
        : summaryLists;
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
