const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export const Strings = {
    sanitize(s: string) {
        return s.replace(/[&<>"']/g, function(s) {
            return entityMap[s];
        });
    }
}
