const createStringHelper = require('../lib/helpers/string');

describe('String Helper', () => {
    let stringHelper;

    beforeEach(() => {
        stringHelper = createStringHelper();
    });

    describe('containsHtml', () => {
        it('should return false for an English sentence', () => {
            const result = stringHelper.containsHtml(
                'the quick brown fox jumped over the lazy dog.'
            );
            expect(result).toEqual(false);
        });

        it('should return false for an English sentence with special symbols', () => {
            const result = stringHelper.containsHtml('the "quick" brown fox = foobar > 13');
            expect(result).toEqual(false);
        });

        it('should return false for escaped HTML symbols', () => {
            const result = stringHelper.containsHtml('lorem ipsum &lt;span&gt;');
            expect(result).toEqual(false);
        });

        it('should return true for some HTML within a string', () => {
            const result = stringHelper.containsHtml(
                'This is a string with a <strong>valid</strong> HTML <a href="#foobar">hyperlink</a> inside it.'
            );
            expect(result).toEqual(true);
        });

        it('should return true for a string fully constructed of HTML', () => {
            const result = stringHelper.containsHtml(
                '<p>lorem ipsum <a href="#foobar"> foo bar</a>. <strong>something</strong> something.</p>'
            );
            expect(result).toEqual(true);
        });
    });
});
