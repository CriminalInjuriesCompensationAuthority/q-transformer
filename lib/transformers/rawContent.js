const merge = require('lodash.merge');

function camelCaseToSnakeCase(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

module.exports = ({schemaKey, schema, options} = {}) => {
    const opts = merge(
        {
            id: schemaKey,
            dependencies: [],
            componentName: 'rawContent',
            content: schema.description
        },
        options
    );

    // parse out dependencies from content
    const rxComponents = /(?<=govuk)\S+?(?=\s*\()/g;
    const componentTypes = opts.content.match(rxComponents);

    // Get dependencies for component
    if (componentTypes) {
        // componentTypes is of format ['WarningText', 'Details', ...]
        opts.dependencies = componentTypes.map(
            componentType =>
                `{% from "${camelCaseToSnakeCase(
                    componentType
                )}/macro.njk" import govuk${componentType} %}`
        );
    }

    // transformation
    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        content: opts.content,
        pageTitle:
            opts.setPageHeading &&
            (opts.macroOptions.fieldset.legend.text || opts.macroOptions.fieldset.legend.html)
    };
};
