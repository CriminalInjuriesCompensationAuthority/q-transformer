const moment = require('moment');

let lookup = {};

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
    if (lookup[answer]) {
        return lookup[answer];
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

function returnPartialDate(fullDate) {
    return moment(fullDate).format('MMMM YYYY');
}

function summaryFormatter(answerObject, fullUiSchema, answerLookup) {
    if (answerLookup) {
        lookup = answerLookup;
    }
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
            if (Object.keys(answerObject[sectionId]).length === 1) {
                // ToDo: Not hard code this!!!!!!
                if (
                    sectionId === 'p-applicant-when-did-the-crime-start' ||
                    sectionId === 'p-applicant-when-did-the-crime-stop'
                ) {
                    answerIndex[sectionId] = returnPartialDate(
                        Object.values(answerObject[sectionId])[0]
                    );
                } else {
                    answerIndex[sectionId] = formatAnswer(
                        Object.values(answerObject[sectionId])[0]
                    );
                }
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
                answerIndex[sectionId] = multipleAnswersFormat(answers); // A question with more than one answer appears in a multi-line format
            }
        }
    });
    return answerIndex;
}

function objectFormatter(obj) {
    const isArray = Array.isArray(obj);
    let returnValue = '';
    if (isArray) {
        obj.forEach(answer => {
            // eslint-disable-next-line no-use-before-define
            const formattedAnswer = formatAnswerV2(answer);
            returnValue += `${formattedAnswer}<br>`;
        });
        return returnValue.substring(0, returnValue.length - 4);
    }
    let lineEnd = '';
    Object.keys(obj).forEach(answer => {
        lineEnd = Object.keys(obj).length > 3 ? '<br>' : ' '; // For large numbers of fields, insert a line break.
        if (obj[answer] !== '') {
            // Ignore empty lines
            // eslint-disable-next-line no-use-before-define
            const formattedAnswer = formatAnswerV2(obj[answer]); // Format the individual answer.
            lineEnd = formattedAnswer === 'Yes' || formattedAnswer === 'No' ? ', ' : lineEnd; // If a question was a boolean, follow it with a comma, not a space.
            returnValue += `${formattedAnswer}${lineEnd}`; // append the answer and the line end to the return string.
        }
    });
    return returnValue.substring(0, returnValue.length - lineEnd.length);
}

function dateFormatterV2(date, format) {
    return moment(date).format(format);
}

function parseDateFormat(datePrecision) {
    if (/^.*[dD].*$/.test(datePrecision)) {
        return 'DD MMMM YYYY';
    }
    return 'MMMM YYYY';
}

function formatAnswerV2(answer, format) {
    if (format && format.value && format.value === 'date-time') {
        const dateFormat = parseDateFormat(format.precision);
        return dateFormatterV2(answer, dateFormat);
    }
    if (typeof answer === 'object' && answer !== null) {
        return objectFormatter(answer);
    }
    return escapeHtml(answer); // If it's a single value string
}

module.exports = {
    summaryFormatter,
    dateFormatter,
    isValidDate,
    multipleAnswersFormat,
    arrayFormatter,
    escapeHtml,
    returnPartialDate,
    formatAnswer,
    formatAnswerV2,
    objectFormatter,
    parseDateFormat
};
