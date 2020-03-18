const merge = require('lodash.merge');
const answerHelper = require('../helpers/answerHelper');

function removeSectionIdPrefix(sectionId) {
    return sectionId.replace(/p-{1,2}/, '');
}

module.exports = ({schemaKey, schema, options, data, fullUiSchema} = {}) => {
    const {summaryStructure} = options;
    const {lookup} = options;
    const {footerText} = schema.summaryInfo;
    const {urlPath} = schema.summaryInfo;
    const {editAnswerText} = schema.summaryInfo;
    const answers = answerHelper.summaryFormatter(data, fullUiSchema, lookup);
    let summaryLists = '';
    summaryStructure.forEach(summaryList => {
        const rows = [];
        Object.keys(summaryList.questions).forEach(question => {
            if (answers[question]) {
                const row = {
                    key: {
                        text: summaryList.questions[question],
                        classes: 'govuk-!-width-one-half'
                    },
                    value: {
                        html: answers[question]
                    },
                    actions: {
                        items: [
                            {
                                href: `/${urlPath}/${removeSectionIdPrefix(
                                    question
                                )}?next=${removeSectionIdPrefix(schemaKey)}`,
                                text: editAnswerText,
                                visuallyHiddenText: summaryList.questions[question]
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
