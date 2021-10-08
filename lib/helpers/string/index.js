function createStringHelper() {
    function containsHtml(str) {
        return /<\/?[a-z][\s\S]*>/i.test(str);
    }

    return Object.freeze({
        containsHtml
    });
}

module.exports = createStringHelper;
