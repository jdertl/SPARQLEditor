YASQE.registerAutocompleter("local_definitions", function(yasqe){
	var autocompleters = yasqe.autocompleters;
	return{
		isValidCompletionPosition: function(){
			return yasqe.getTriples(true, true) != null;
		},
		get: {
			getSubject: function(context, subjectClass, subject, predicate, object, token){
				return autocompleters.partialMatchFilter(autocompleters.getLocalDefinition(), subject);
			},
			getPredicate: function(context, subjectClass, subject, predicate, object, token){
				if(subjectClass){
					var suggestLevel = autocompleters.getLocalDefinition(subjectClass);
					if(suggestLevel){
						return autocompleters.partialMatchFilter(suggestLevel, predicate);
					}
				}
				return [];
			},
			getObject: function(context, subjectClass, subject, predicate, object, token){
				if(autocompleters.classDesignators[predicate]){
					return autocompleters.partialMatchFilter(autocompleters.getLocalDefinition(), object);
				}
				else if(subjectClass && predicate){
					var suggestLevel = autocompleters.getLocalDefinition(subjectClass, predicate);
					if(suggestLevel){
						return autocompleters.partialMatchFilter(suggestLevel, object);
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