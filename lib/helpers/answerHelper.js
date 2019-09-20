const moment = require('moment');
const policeLookup = require('./policeLookup');
const answerLookup = require('./answerLookup');

function removeSectionIdPrefix(sectionId) {
    return sectionId.replace(/p-{1,2}/, '');
}

function dateFormatter(date) {
    return moment(date).format('DD MMMM YYYY');
}

function isValidDate(str) {
    return moment(str, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]', true).isValid();
}

function arrayFormatter(array) {
    let returnValue = '';
    array.forEach(answer => {
        // eslint-disable-next-line no-use-before-define
        const formattedAnswer = formatAnswer(answer);
        returnValue += `${formattedAnswer}<br>`;
    });
    return returnValue;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatAnswer(answer) {
    const isADate = isValidDate(answer);
    const isArray = Array.isArray(answer);
    if (isADate) {
        return dateFormatter(answer);
    }
    if (isArray) {
        return arrayFormatter(answer);
    }
    if (typeof answer === 'number') {
        const policeRef = policeLookup(answer);
        if (policeRef) {
            return policeRef;
        }
    }
    if (answerLookup(answer)) {
        return answerLookup(answer);
    }
    return escapeHtml(answer); // If it's a single value string
}

function multipleAnswersFormat(sectionObject) {
    let answerInstructions = '';
    if (!sectionObject) {
        return ''; // If the sectionObject is empty, return a blank string.
    }
    let lineEnd = ' '; // Default break between questions is a space.
    Object.values(sectionObject).forEach(question => {
        lineEnd = Object.keys(sectionObject).length > 3 ? '<br>' : ' '; // For large numbers of fields, insert a line break.
        if (question !== '') {
            // Ignore empty lines
            const formattedQuestion = formatAnswer(question); // Format the individual answer.
            lineEnd = formattedQuestion === 'Yes' || formattedQuestion === 'No' ? ', ' : lineEnd; // If a question was a boolean, follow it with a comma, not a space.
            answerInstructions += `${formattedQuestion}${lineEnd}`; // append the answer and the line end to the return string.
        }
    });
    return answerInstructions.substring(0, answerInstructions.length - lineEnd.length); // remove trailing break
}

function summaryFormatter(answerObject, fullUiSchema) {
    const answerIndex = {};
    if (!answerObject) {
        return {};
    }
    Object.keys(answerObject).forEach(sectionId => {
        // Ignore non-question entries
        if (
            Object.entries(answerObject[sectionId]).length !== 0 &&
            answerObject[sectionId].constructor === Object
        ) {
            answerIndex[sectionId] = {
                href: `/apply/${removeSectionIdPrefix(sectionId)}?next=check-your-answers`
            };
            if (Object.keys(answerObject[sectionId]).length === 1) {
                answerIndex[sectionId].value = formatAnswer(
                    Object.values(answerObject[sectionId])[0]
                );
            } else {
                let answers = answerObject[sectionId];
                const uiSchema = fullUiSchema[sectionId];
                if (uiSchema && uiSchema.options && uiSchema.options.outputOrder) {
                    const order = [
                        ...new Set([
                            ...uiSchema.options.outputOrder,
                            ...Object.keys(answerObject[sectionId])
                        ])
                    ];
                    answers = JSON.parse(JSON.stringify(answers, order));
                }
                answerIndex[sectionId].value = multipleAnswersFormat(answers); // A question with more than one answer appears in a multi-line format
            }
        }
    });
    return answerIndex;
}

module.exports = {
    summaryFormatter,
    dateFormatter,
    isValidDate,
    multipleAnswersFormat,
    arrayFormatter
};
