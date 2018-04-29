YASQE.registerAutocompleter("local_definitions", function(yasqe){
	var classDesignators = {"a": true, "rdf:type": true, "https://www.w3.org/1999/02/22-rdf-syntax-ns#type": true};
	return{
		isValidCompletionPosition: function(){
			return yasqe.getTriples(true, true) != null;
		},
		get: {
			getSubject: function(context, subjectClass, subject, predicate, object, token){
				return yasqe.autocompleters.partialMatchFilter(yasqe.autocompleters.getLocalDefinition(), subject);
			},
			getPredicate: function(context, subjectClass, subject, predicate, object, token){
				if(subjectClass){
					var suggestLevel = yasqe.autocompleters.getLocalDefinition(subjectClass);
					if(suggestLevel){
						return yasqe.autocompleters.partialMatchFilter(suggestLevel, predicate);
					}
				}
				return [];
			},
			getObject: function(context, subjectClass, subject, predicate, object, token){
				if(classDesignators[predicate]){
					return yasqe.autocompleters.partialMatchFilter(yasqe.autocompleters.getLocalDefinition(), object);
				}
				else if(subjectClass && predicate){
					var suggestLevel = yasqe.autocompleters.getLocalDefinition(subjectClass, predicate);
					if(suggestLevel){
						return yasqe.autocompleters.partialMatchFilter(suggestLevel, object);
					}
				}
				return [];
			}
		},
		async: false,
		bulk: false,
		autoShow: true,
		getUsesCompleteToken: true
	};
});