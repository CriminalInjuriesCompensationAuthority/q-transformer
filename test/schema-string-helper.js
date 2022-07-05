// Remove indentation from strings when comparing them
function removeIndentation(val) {
    const regex = /^\s+/gm;

    if (val && typeof val === 'object' && !Array.isArray(val)) {
        return JSON.parse(
            JSON.stringify(val, (key, value) => {
                if (typeof value === 'string') {
                    return value.replace(regex, '');
                }

                return value;
            })
        );
    }

    return val.replace(regex, '');
}

function escapeSchemaContent(schema) {
    // Double escape any "\\" to work around this issue: https://github.com/mozilla/nunjucks/issues/625
    const schemaAsJson = JSON.stringify(schema);
    const schemaWithEscapedContent = JSON.parse(schemaAsJson.replace(/\\\\/g, '\\\\\\\\'));

    return schemaWithEscapedContent;
}

module.exports = {removeIndentation, escapeSchemaContent};
