const createStringHelper = require('../helpers/string');
const merge = require('lodash.merge');

module.exports = ({schemaKey, schema, options} = {}) => {
    const stringHelper = createStringHelper();
    const {taskListData, labelCompleted, labelIncomplete, labelCannotStart} = schema.properties.taskListInfo;
    let taskLists = '';
    const heading = schema.title;
    const description = schema.description;

    taskListData.forEach(section => {
        const taskListTasks = [];
        console.log({section});
        section.tasks.forEach(task => {
            const newTask = {};
            
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
                    if (task.status === 'completed') {
                        newTask.status = {
                            text: labelCompleted,
                            classes: task.id
                        };
                    } else if (task.status === 'incomplete') {
                        newTask.status = {
                            tag: {
                                text: labelIncomplete,
                                classes: task.id
                            }
                        };
                    } else if (task.status === 'cannotStartYet') {
                        newTask.status = {
                            text: labelCannotStart,
                            classes: `${task.id} govuk-task-list__status--cannot-start-yet`
                        };
                    } else {
                        if (stringHelper.containsHtml(task.status)) {
                            newTask.status.html = task.status;
                        } else {
                            newTask.status.text = task.status;
                        }
                    }
                } else if (task.status instanceof Object) {
                    if ('tag' in task.status) {
                        newTask.status = task.status.tag;
                    } else {
                        newTask.status = task.status;
                    }
                }
            }


            taskListTasks.push(newTask);
        });
        const taskList = `
            <h2 id="govuk-task-list-section-heading-${section.id}" class="govuk-heading-m govuk-task-list-section-heading">${section.title}</h2>
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

    const content = `
        <h1 class="govuk-heading-xl">${heading}</h1>
        <p class="govuk-body">${description}</p>
        ${taskLists}
    `;

    let opts = {
        id: schemaKey,
        dependencies: ['{% from "task-list/macro.njk" import govukTaskList %}'],
        componentName: 'task-list',
        content
    };

    opts = merge(opts, options);

    return {
        id: opts.id,
        dependencies: opts.dependencies,
        componentName: opts.componentName,
        content: opts.content
    };
};
