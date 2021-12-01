module.exports = {
    content: `
        {% from "radios/macro.njk" import govukRadios %}
        {{ govukRadios({
           "idPrefix": "q-radio-button",
           "name": "q-radio-button",
           "fieldset": {
               "legend": {
                   "text": "This is a radio button test",
               "isPageHeading": true,
               "classes": "govuk-fieldset__legend--xl"
        }
        },
        "hint": null,
        "items": [
            {
                "value": true,
                "text": "Yes"
            },
            {
                "value": false,
                "text": "No"
            }
        ],
        "classes": "govuk-radios--inline"
        }) }}`,
    pageTitle: 'This is a radio button test',
    hasErrors: false
};
