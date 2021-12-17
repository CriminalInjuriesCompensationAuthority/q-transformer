module.exports = {
    pageTitle: 'Page Title',
    hasErrors: false,
    content: `{% from "input/macro.njk" import govukInput %}
    <h1 class="govuk-heading-xl">Page Title</h1>
    {{ govukInput({
        "id": "q-input-type-text",
        "name": "q-input-type-text",
        "type": "text",
        "label": {
            "html": "Enter text"
        },
        "hint": {
            "text": "You can provide any text."
        }
    }) }}
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
