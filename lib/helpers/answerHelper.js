const moment = require('moment');
const policeLookup = require('./policeLookup');

function removeSectionIdPrefix(sectionId) {
    return sectionId.replace(/p-{1,2}/, '');
}

function dateFormatter(date) {
    return moment(date).format('DD MMMM YYYY');
}

function isValidDate(str) {
    const d = Date.parse(str);
    // eslint-disable-next-line no-restricted-globals
    return !isNaN(d);
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

function textFormatter(string) {
    if (string === '') {
        return '';
    }
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/-/g, ' ');
}

function formatAnswer(answer) {
    const isADate = isValidDate(answer);
    const isArray = Array.isArray(answer);
    switch (answer) {
        case true: // If it's a true values
        case 'true':
            return 'Yes';
        case false: // If it's a false value
        case 'false':
            return 'No';
        default:
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
            return textFormatter(answer); // If it's a single value string
    }
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

function summaryFormatter(answerObject) {
    const answerIndex = {};
    if (answerObject) {
        Object.keys(answerObject).forEach(question => {
            answerIndex[question] = {};
            answerIndex[question].href = `/apply/${removeSectionIdPrefix(
                question
            )}?next=check-your-answers`;
            if (answerObject[question] !== {}) {
                // Ignore non-question entries
                if (Object.keys(answerObject[question]).length === 1) {
                    answerIndex[question].value = formatAnswer(
                        Object.values(answerObject[question])[0]
                    );
                } else {
                    answerIndex[question].value = multipleAnswersFormat(answerObject[question]); // A question with more than one answer appears in a multi-line format
                }
            }
        });
    }
    return answerIndex;
}

module.exports = {
    summaryFormatter,
    dateFormatter,
    isValidDate,
    textFormatter,
    multipleAnswersFormat,
    arrayFormatter
};
