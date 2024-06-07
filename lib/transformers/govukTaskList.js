const createStringHelper = require('../helpers/string');

module.exports = ({schemaKey, schema} = {}) => {
    const stringHelper = createStringHelper();
    const {sections, labelCompleted, labelIncomplete, labelCannotStart} = schema.properties['task-list'].properties.taskListInfo;
    let taskLists = '';
    const heading = schema.properties['task-list'].title;
    const {description} = schema.properties['task-list'];

    const dependencies = ['{% from "task-list/macro.njk" import govukTaskList %}'];

    function getNunjucksImports(dependenciesArray) {
        const uniqueDependencies = new Set(dependenciesArray);
        return Array.from(uniqueDependencies);
    }

    sections.forEach(section => {
        const taskListTasks = [];
        section.tasks.forEach(task => {
            const newTask = {};
            let isApplicable = true;

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
                    } else if (task.status === 'notApplicable') {
                        isApplicable = false
                    } else if (task.status === 'cannotStartYet') {
                        newTask.status = {
                            text: labelCannotStart,
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

            if(isApplicable) {
                taskListTasks.push(newTask);
            }
        });
        const taskList = `
            <h2 id="govuk-task-list-section-heading-${
                schemaKey   
            }" class="govuk-heading-m govuk-task-list-section-heading">${section.title}</h2>
            {{ govukTaskList({
                idPrefix: ${schemaKey},
                items: ${JSON.stringify(taskListTasks, null, 4)},
                attributes: {
                    id: ${schemaKey}
                }
            }) }}
        `;

        taskLists += taskList;
    });

    const content = `
        ${getNunjucksImports(dependencies)}
        <h1 class="govuk-heading-xl">${heading}</h1>
        <p class="govuk-body">${description}</p>
        ${taskLists}
    `;

    return {
        content,
        pageTitle: 'Task List',
        hasErrors: false
    };
};
