const merge = require('lodash.merge');

const createStringHelper = require('../helpers/string');

module.exports = ({schemaKey, schema, options} = {}) => {
    const stringHelper = createStringHelper();
    const {sections} = schema.properties.taskListInfo;
    let taskLists = '';
    const heading = schema.title;
    const {description} = schema;

    let opts = {
        id: schemaKey,
        dependencies: ['{% from "task-list/macro.njk" import govukTaskList %}'],
        componentName: 'govukTaskList'
    };

    sections.forEach(section => {
        const taskListTasks = [];
        section.tasks.forEach(task => {
            const newTask = {};
            let includeTask = true;

            if ('title' in task) {
                newTask.title = {};
                if (stringHelper.containsHtml(task.title)) {
                    newTask.title.html = task.title;
                } else {
                    newTask.title.text = task.title;
                }
            }

            if ('hint' in task) {
                newTask.hint = {};
                if (stringHelper.containsHtml(task.hint)) {
                    newTask.hint.html = task.hint;
                } else {
                    newTask.hint.text = task.hint;
                }
            }

            if ('href' in task) {
                newTask.href = task.href;
            }

            if ('status' in task) {
                newTask.status = {};
                if (typeof task.status === 'string' || task.status instanceof String) {
                    if (task.status === 'notApplicable') {
                        includeTask = false;
                    } else if (task.status === 'completed') {
                        newTask.status = {
                            text: 'Completed',
                            classes: task.id
                        };
                    } else if (task.status === 'incomplete') {
                        newTask.status = {
                            tag: {
                                text: 'Incomplete',
                                classes: task.id
                            }
                        };
                    } else if (task.status === 'cannotStartYet') {
                        newTask.status = {
                            text: 'Cannot start yet',
                            classes: `${task.id} govuk-task-list__status--cannot-start-yet`
                        };
                    } else if (stringHelper.containsHtml(task.status)) {
                        newTask.status.html = task.status;
                    } else {
                        newTask.status.text = task.status;
                    }
                } else if (task.status instanceof Object) {
                    if ('tag' in task.status) {
                        newTask.status = task.status.tag;
                    } else {
                        newTask.status = task.status;
                    }
                }
            }

            if (includeTask === true) {
                taskListTasks.push(newTask);
            }
        });
        const taskList = `
            <h2 id="govuk-task-list-section-heading-${
                section.id
            }" class="govuk-heading-m govuk-task-list-section-heading">${section.title}</h2>
            {{ govukTaskList({
                idPrefix: ${section.id},
                items: ${JSON.stringify(taskListTasks, null, 4)},
                attributes: {
                    id: ${section.id}
                }
            }) }}
        `;

        taskLists += taskList;
    });

    opts.content = `
        <h1 class="govuk-heading-xl">${heading}</h1>
        <p class="govuk-body">${description}</p>
        ${taskLists}
    `;

    opts = merge(opts, options);

    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        content: opts.content
    };
};
