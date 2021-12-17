module.exports = {
    pageTitle: 'Enter your name',
    hasErrors: false,
    content: `
    {% from "input/macro.njk" import govukInput %}
    {% from "fieldset/macro.njk" import govukFieldset %}
    {% call govukFieldset({
        legend: {
            html: "Enter your name",
            classes: "govuk-fieldset__legend--xl",
            isPageHeading: true
        }
    }) %}
    {{ govukInput({
        "id": "q-applicant-title",
        "name": "q-applicant-title",
        "type": "text",
        "label": {
            "html": "Title"
        },
        "hint": null,
        "classes": "govuk-input--width-10"
    }) }}
    {{ govukInput({
        "id": "q-applicant-last-name",
        "name": "q-applicant-last-name",
        "type": "text",
        "label": {
           "html": "Last name"
        },
        "hint": null,
        "classes": "govuk-input--width-30"
    }) }}
    {% endcall %}`
};
