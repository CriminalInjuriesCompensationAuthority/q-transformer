module.exports = {
    content: `
        {% from "input/macro.njk" import govukInput %}
        {{ govukInput({
            "id": "q-input-type-textn",
            "name": "q-input-type-textn",
            "type": "text",
            "label": {
                "html": "Enter input text",
                "isPageHeading": true,
                "classes": "govuk-label--xl"
            },
            "hint": {
                "text": "You can provide any input text."
            }
        }) }}`,
    pageTitle: 'Enter input text',
    hasErrors: false
};
