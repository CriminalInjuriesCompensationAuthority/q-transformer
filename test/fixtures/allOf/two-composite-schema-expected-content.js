module.exports = {
    pageTitle: 'Two Composite Page Title',
    hasErrors: false,
    content: `{% from "input/macro.njk" import govukInput %}
    <h1 class="govuk-heading-xl">Two Composite Page Title</h1>
    {% from "fieldset/macro.njk" import govukFieldset %}
    {% call govukFieldset({
        legend: {
            html: "Enter question name",
            classes: "govuk-fieldset__legend--m",
            isPageHeading: false
        }
    }) %}
    {{ govukInput({
        "id": "q-title",
        "name": "q-title",
        "type": "text",
        "label": {
            "html": "Q-Title"
        },
        "hint": null,
        "classes": "govuk-input--width-10"
    }) }}
    {{ govukInput({
        "id": "q-name",
        "name": "q-name",
        "type": "text",
        "label": {
           "html": "Q-Last name"
        },
        "hint": null,
        "classes": "govuk-input--width-30"
    }) }}
    {% endcall %}
    {% from "fieldset/macro.njk" import govukFieldset %}
    {% call govukFieldset({
        legend: {
            html: "Enter your name",
            classes: "govuk-fieldset__legend--m",
            isPageHeading: false
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
