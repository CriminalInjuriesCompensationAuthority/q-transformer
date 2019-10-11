const nanoid = require('nanoid');

const uuidToken = nanoid();
const rxToken = new RegExp(`"${uuidToken}|${uuidToken}"`, 'g');

function createNunjucksHelper() {
    function toNunjucksId(id) {
        return id.replace(/[^0-9a-zA-Z_$]/g, '_');
    }

    function toNunjucks(componentName, componentOptions) {
        const nestedComponents = [];

        function stringifyNestedComponents(key, value) {
            if (key === 'html') {
                if (Array.isArray(value)) {
                    const ids = [];
                    const instructions = value.map(instruction => {
                        // Ensure the id can be used as a variable identifier e.g. only characters [0-9a-zA-Z_$]
                        // e.g. some-id becomes some_id
                        const nunjucksId = toNunjucksId(instruction.id);
                        ids.push(nunjucksId);

                        return `{% set ${nunjucksId} %}${toNunjucks(
                            instruction.componentName,
                            instruction.macroOptions
                        )}{% endset -%}`;
                    });

                    nestedComponents.push(...instructions);

                    // The returned nested component reference can't be quoted or it'll be treated as a literal string e.g.
                    // {
                    //     "conditional": {
                    //         "html": "([email] | join())"
                    //     }
                    // }
                    //
                    // JSON stringify quotes all values. We need to post process the result string to remove these quotes.
                    // To indicate the quotes need to be removed, we can pre/postfix the value with a token which combined
                    // with the enclosing quotes marks them for removal e.g.
                    // {"key": "<token>value<token>"} "<token> and <token>" are removed resulting in {"key": value}
                    // To ensure the value itself doesn't contain the token (which would be incorrectly replaced), we
                    // use a UUID for this purpose.
                    return `${uuidToken}([${ids.join()}] | join())${uuidToken}`;
                }
            }

            return value;
        }

        const output = `${componentName}(${JSON.stringify(
            componentOptions,
            stringifyNestedComponents,
            4 // Keep indentation in place to avoid minified objects becoming "}}" and breaking nunjucks
        )})`.replace(rxToken, ''); // Remove special quotes "_ & _";

        return `${nestedComponents.join('\n')}{{ ${output} }}`;
    }

    return Object.freeze({
        toNunjucks
    });
}

module.exports = createNunjucksHelper;
