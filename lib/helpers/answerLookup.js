function lookupName(index) {
    const answerList = {
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
        'option-1:-sexual-assault-or-abuse': 'Option 1: Sexual assault or abuse',
        'option-2:-sexual-assault-or-abuse-and-other-injuries-or-losses':
            'Option 2: Sexual assault or abuse and other injuries or losses',
        myself: 'Myself',
        'someone-else': 'Someone else',
        england: 'England',
        scotland: 'Scotland',
        wales: 'Wales',
        'somewhere-else': 'Somewhere else',
        'i-have-no-contact-with-the-offender': 'I have no contact with the offender'
    };
    return answerList[index];
}

module.exports = lookupName;
