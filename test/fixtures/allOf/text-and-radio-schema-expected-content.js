module.exports = {
    pageTitle: 'Enter text',
    hasErrors: false,
    content: `
    {% from "input/macro.njk" import govukInput %}
    {% from "radios/macro.njk" import govukRadios %}
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
    {{ govukRadios({
        "idPrefix": "q-radio-button",
        "name": "q-radio-button",
        "fieldset": {
            "legend": {
                "text": "This is a radio button test"
     }
     },
     "hint": null,
     "items": [
         {
             "value": true,
             "text": "Yes",
             "hint": {
                "text": "you can put description here"
             }
         },
         {
             "value": false,
             "text": "No",
             "hint": {
                "text": "you can put description here"
             }
         }
     ],
     "classes": "govuk-radios--inline"
     }) }}`
};
