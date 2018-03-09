/**
 * Gosparqled plugin for YASQE
 */

// Adds a symbol to the query defining what should be recommended
var formatQueryForAutocompletion = function(partialToken, query) {
     var cur = yasqe.getCursor(false);
     var begin = yasqe.getRange({line: 0, ch:0}, cur);
     query = begin + "< " + query.substring(begin.length, query.length);
     return query;
};

/**
 * Autocompletion function
 */
var customAutocompletionFunction = function(partialToken, callback) {
    $("#error").html("")
    autocompletion.RecommendationQuery(formatQueryForAutocompletion(partialToken, yasqe.getValue()), function(q, type, err) {
        if (err) {
            $("#error").html(ansi_up.ansi_to_html(err))
            return
        }
        if (!q) {
            alert("No recommendation at this position")
            return
        }
        var ajaxConfig = {
            type: "GET",
            crossDomain: true,
            url: sparqled.config.endpoint,
            data: {
                format: 'application/json',
                query: q
            },
            success: function(data) {
                // Get the list of recommended terms
                var completions = [];
                for (var i = 0; i < data.results.bindings.length; i++) {
                    var binding = data.results.bindings[i];
                    var pof = binding.POF.value
                    switch (binding.POF.type) {
                        case "typed-literal":
                            pof = "\"" + pof + "\"^^<" + binding.POF["datatype"] + ">"; 
                            break;
                        case "literal":
                            if (type === autocompletion.PATH) {
                                // The property path is built as a concatenation
                                // of URIs' label. It is then typed as a Literal.
                                break;
                            }
                            if ("xml:lang" in binding.POF) {
                                pof = "\"" + pof + "\"@" + binding.POF["xml:lang"];
                            } else {
                                pof = "\"" + pof + "\""
                            }
                            break;
                        case "uri":
                            pof = "<" + pof + ">";
                            break;
                    }
                    completions.push(pof);
                }
                callback(completions);
            },
            beforeSend: function(){
                $('#loading').show();
            },
            complete: function(){
                $('#loading').hide();
            }
        };
        $.ajax(ajaxConfig);
    })
};

/*
 * Plug the recommendation to the YASQE editor
 */

// If token is an uri, return its prefixed form
var postprocessResourceTokenForCompletion = function(token, suggestedString) {
    if (token.tokenPrefix && token.autocompletionString && token.tokenPrefixUri) {
        // we need to get the suggested string back to prefixed form
        suggestedString = token.tokenPrefix + suggestedString.substring(1 + token.tokenPrefixUri.length, suggestedString.length - 1); // remove wrapping angle brackets
    }
    return suggestedString;
};

YASQE.registerAutocompleter("sparqled", function(yasqe) {
    return {
        async : true,
        bulk : false,
        isValidCompletionPosition : function() { return true;  },
        get : customAutocompletionFunction,
        preProcessToken: function(token) {return YASQE.Autocompleters.properties.preProcessToken(yasqe, token)},
        postProcessToken: postprocessResourceTokenForCompletion
    };
});
YASQE.registerAutocompleter("test", function(yasqe){
	return {
		async: false,
		bulk: false,
		isValidCompletionPosition: function() {return true;},
		autoShow: true,
		get: ["test1", ["tloop", "t(int i = 0;...)"], "testtest"]
	};
})

YASQE.registerAutocompleter("local_definitions", function(yasqe){
	var classDesignators = {"a": true, "rdf:type": true, "https://www.w3.org/1999/02/22-rdf-syntax-ns#type": true};
	
	var lookup = {
		"<streets>": {
			"<nh:length>": ["Def: 100", "100"],  // Display first parameter, but insert second
			"<nearby>": true,  // Only as predicate with no suggested objects
		},
		"<places>":{
			"<nh:name>": "\"Fair Haven School\"",  // Both display and insert
		}
	};

	return{
		isValidCompletionPosition: function(){
			return yasqe.getTriples(true) != null;
		},
		preProcessToken: function(token){
			var triples = yasqe.getTriples(null, true);
			var curLine = triples.cursor[0];
			var seekVar = triples.data[curLine][0];
			if(seekVar.indexOf("?") == -1){
				token.subjectClass = seekVar;
				return token;
			}
			var foundClass;
			for(var i = 0; i < triples.data.length; i++){
				if(i != curLine && triples.data[i][0] == seekVar && classDesignators[triples.data[i][1]]){
					token.subjectClass = triples.data[i][2];
					break;
				}
			}
			return token
		},
		get: function(token){
			var triples = yasqe.getTriples(null, true);
			var cursor = triples.cursor;
			if(cursor[1] >= 0 && cursor[1] <= 2){

				// INSERT SUGGESTION LOOKUP HERE
				var suggestLevel = lookup;
				if(suggestLevel && cursor[1] > 0){
					suggestLevel = suggestLevel[token.subjectClass];
					if(suggestLevel && cursor[1] > 1){
						suggestLevel = suggestLevel[triples.data[cursor[0]][1]];
						if(suggestLevel && typeof(suggestLevel) != "boolean"){
							return [suggestLevel];
						}
					}
				}
				if(suggestLevel){
					var suggest = [];
					for(var key in suggestLevel){
						suggest.push(key);
					}
					return suggest;
				}

			}
			return [];
		},
		// postProcessToken: function(token, suggestedString){
		// },
		async: false,
		bulk: false,
		autoShow: false,
		getUsesCompleteToken: true
	};
});

YASQE.defaults.autocompleters = [
	"prefixes",
	"variables",
	"properties",
	// "sparqled",
	"local_definitions",
	// "test",
];



var yasqe = YASQE(document.getElementById("yasqe"), {
	sparql: {
        endpoint: sparqled.config.endpoint,
		showQueryButton: true
	},
});
var yasr = YASR(document.getElementById("yasr"), {
	getUsedPrefixes: yasqe.getPrefixesFromQuery
});

/**
* Set some of the hooks to link YASR and YASQE
*/
yasqe.options.sparql.handlers.success =  function(data, status, response) {
	yasr.setResponse({response: data, contentType: response.getResponseHeader("Content-Type")});
};
yasqe.options.sparql.handlers.error = function(xhr, textStatus, errorThrown) {
	yasr.setResponse({exception: textStatus + ": " + errorThrown});
};

