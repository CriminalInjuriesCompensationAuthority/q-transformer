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

module.exports = ({schemaKey, schema, options} = {}) => {
    const {summaryStructure, urlPath, editAnswerText} = schema.properties.summaryInfo;
    let summaryLists = '';
    const header = schema.description;
    function sortValue(value) {
        const answer = {
            id: value.sectionId,
            label: value.label,
            value: {}
        };
        if (value.type === 'composite') {
            value.values.forEach(valueObject => {
                const {id} = valueObject;
                answer.value[id] = sortValue(valueObject).value;
            });
        } else {
            answer.value = value.valueLabel ? value.valueLabel : value.value;
        }
        return answer;
    }

    summaryStructure.forEach(theme => {
        if (theme.type === 'theme') {
            const summaryRows = [];
            const values = theme.values ? theme.values : [];
            if (values.length > 0) {
                values.forEach(value => {
                    const precision = value.format ? value.format : {};
                    const answer = sortValue(value);
                    const summaryRow = {
                        key: {
                            text: answer.label,
                            classes: 'govuk-!-width-one-half'
                        },
                        value: {
                            html: answerHelper.formatAnswerV2(answer.value, precision)
                        },
                        actions: {
                            items: [
                                {
                                    href: `/${urlPath}/${removeSectionIdPrefix(
                                        answer.id
                                    )}?next=${removeSectionIdPrefix(schemaKey)}`,
                                    text: editAnswerText,
                                    visuallyHiddenText: answer.label
                                }
                            ]
                        }
                    };
                    if (schema.downloadSummary) {
                        delete summaryRow.actions;
                    }
                    summaryRows.push(summaryRow);
                });
                // Complete the govukSummaryList object by including a class. Section title also added here.
                // Add header title at beginning of page
                if (summaryLists === '') {
                    summaryLists += `<h1 class="govuk-heading-l">${header}</h1>\n<h2 class="govuk-heading-l">${
                        theme.title
                    }</h2>\n
                      {{ govukSummaryList({
                        classes: 'govuk-!-margin-bottom-9',
                        rows: ${JSON.stringify(summaryRows, null, 4)}
                      }) }}`;
                } else {
                    summaryLists += `<h2 class="govuk-heading-l">${theme.title}</h2>\n
                      {{ govukSummaryList({
                        classes: 'govuk-!-margin-bottom-9',
                        rows: ${JSON.stringify(summaryRows, null, 4)}
                      }) }}`;
                }
            }
        }
    });

    const opts = merge(
        {
            id: schemaKey,
            dependencies: ['{% from "summary-list/macro.njk" import govukSummaryList %}'],
            componentName: 'summary',
            content: summaryLists
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
