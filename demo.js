var addFunc = yasqe.autocompleters.addLocalDefinition;

var data = {
	"apartment": {
		"baths": ["1", "2"],
		"bedrooms": ["1", "2"],
		"nearby": [["Looking for <park>", ""], ["Looking for <pond>", ""], ["Looking for <school>", ""]],
		"pets_allowed": ["true", "false"]
	},
	"house": {
		"baths": ["1", "2", "3", "4"],
		"bedrooms": ["1", "2", "3"],
		"nearby": [["Looking for <park>", ""], ["Looking for <pond>", ""], ["Looking for <school>", ""]],
		"sqft": [["Small", "1000"], ["Medium", "2500"], ["Large", "4000"]]
	},
	"park": {
		"name": true,
		"national": ["true", "false"],
		"night_lighting": ["true", "false"],
		"waterfront": [["Looking for <pond>", ""]]
	},
	"pond": {
		"name": true,
		"fishing": ["true", "false"]
	},
	"school": {
		"capacity": [["Small", "250"], ["Medium", "400"], ["Large", "650"]],
		"grades": ["\"K_12\"", "\"K_5\"", "\"6_8\"", "\"9_12\""],
		"name": true,
		"nearby": [["Looking for <apartment>", ""], ["Looking for <house>", ""]],
		"staff": ["100", "200", "400"]
	}
};

for(var sub in data){
	var group = data[sub];
	sub = "<"+sub+">";
	for(var pred in group){
		var objs = group[pred];
		pred = "<"+pred+">"
		addFunc(sub, pred);
		if(typeof objs != 'boolean'){
			for(var obj in objs){
				addFunc(sub, pred, objs[obj]);
			}
		}
	}
}