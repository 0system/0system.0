h("table.ui.striped.table", {"dataset":{}}, ch({"id":"table","impl":"Table"}, function () { return [ "\n          ", h("thead", [ "\n            ", h("tr", [ "\n              ", h("th", [ "Col 1" ]), "\n              ", h("th", [ "Col 2" ]), "\n            " ]), "\n          " ]), "\n          ", h("tbody", {"dataset":{}}, ch({"section":"row"}, function () { return [ "\n            ", ch({"section":"row","view":"default"}, function () { return h("tr", {"dataset":{}}, [ "\n              ", h("td", {"dataset":{"componentProp":"title"}}, ch({"property":"title"}, function () { return [ "Title 1" ]; })), "\n              ", h("td", {"dataset":{"componentProp":"url"}}, ch({"property":"url"}, function () { return [ "http://..." ]; })), "\n            " ]); }), "\n          " ]; })), "\n        " ]; }))