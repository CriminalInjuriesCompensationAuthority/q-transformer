module.exports = {
    pageTitle: 'Page Title',
    hasErrors: false,
    content: `{% from "radios/macro.njk" import govukRadios %}
    {% from "details/macro.njk" import govukDetails %}
    {% from "input/macro.njk" import govukInput %}
    <h1 class="govuk-heading-xl">Page Title</h1>
    {{ govukRadios({
        "idPrefix": "q-applicant-has-crime-reference-number",
        "name": "q-applicant-has-crime-reference-number",
        "fieldset": {
            "legend": {
                "text": "Do you have a crime reference number?"                
        }
    },
    "hint": {
        "text": "This is the number the police gave the crime when it was reported. We need this to get information about the crime from them. You will need to add this later in the application."},"items": [{"value": true,"text": "Yes"},{"value": false,"text": "No"}],"classes": "govuk-radios--inline"}) }}{% from "components/details/macro.njk" import govukDetails %}{{ govukDetails({summaryText: "I do not know the crime reference number",html: '<p class="govuk-body">If you do not have your crime reference number, call 101 to speak to your local police station. They can help you get this.</p>'
        })
    }}
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
