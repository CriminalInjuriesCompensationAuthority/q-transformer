const merge = require('lodash.merge');

function camelCaseToSnakeCase(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

module.exports = ({schemaKey, schema, options} = {}) => {
    const transformation = merge(
        {
            id: schemaKey,
            dependencies: [],
            componentName: 'content',
            content: schema.description
        },
        options
    );

    // parse out dependencies from content
    const rxComponents = /(?<=govuk)\S+?(?=\s*\()/g;
    const componentTypes = transformation.content.match(rxComponents);

    if (componentTypes) {
        // componentTypes is of format ['WarningText', 'Details', ...]

        transformation.dependencies = componentTypes.map(
            componentType =>
                `{% from "${camelCaseToSnakeCase(
                    componentType
                )}/macro.njk" import govuk${componentType} %}`
        );
    }

    return transformation;
};
