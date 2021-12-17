module.exports = {
    content: `
    {% from "input/macro.njk" import govukInput %}
    {% from "date-input/macro.njk" import govukDateInput %}
    <h1 class="govuk-heading-xl">Passport details</h1>
    {{ govukInput({
          "id": "q-passport-number",
          "name": "q-passport-number",
          "type": "text",
          "label": {
            "html": "Passport number"
            },
            "hint": {
              "text": "For example, 502135326"
            },
              "classes": "govuk-input--width-10"
             }) }}
    {{ govukDateInput({
        "id": "q-expiry-date",
            "fieldset": {
              "legend": {
                "text": "Expiry date"
                }
            },
          "hint": {
            "text": "For example, 31 3 1980"
            },
          "items": [
            {
            "label": "Day",
            "classes": "govuk-input--width-2",
            "id": "q-expiry-date[day]",
            "name": "q-expiry-date[day]",
            "attributes": {
                "maxlength": "2"
            }
            },
            {
              "label": "Month",
              "classes": "govuk-input--width-2",
              "id": "q-expiry-date[month]",
              "name": "q-expiry-date[month]",
              "attributes": {
                  "maxlength": "2"
                }
              },
              {
                "label": "Year",
                "classes": "govuk-input--width-4",
                "id": "q-expiry-date[year]",
                "name": "q-expiry-date[year]",
                "attributes": {
                  "maxlength": "4"
                }
            }
        ]
    }) }}`,
    pageTitle: 'Passport details',
    hasErrors: false
};
