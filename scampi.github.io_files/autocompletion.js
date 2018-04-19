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
	var filterSuggestions = function(list, token){
		token = token || "";
		var suggestions = [];
		if(Array.isArray(list)){
			var completion;
			for(var k in list){
				completion = list[k];
				if((Array.isArray(completion) ? completion[0] : completion).includes(token)){
					suggestions.push(completion);
				}
			}
		}
		else{
			for(var k in list){
				if(k.includes(token)){
					suggestions.push(k);
				}
			}
		}
		return suggestions;
	}
	return{
		isValidCompletionPosition: function(){
			return yasqe.getTriples(true, true) != null;
		},
		get: {
			getSubject: function(context, subject, predicate, object, token){
				return [];
			},
			getPredicate: function(context, subject, predicate, object, token){
				return [];
			},
			getObject: function(context, subject, predicate, object, token){
				return [];
			}
		},
		async: false,
		bulk: false,
		autoShow: true,
		getUsesCompleteToken: true
	};
});

YASQE.defaults.autocompleters = [
	// "prefixes",
	"variables",
	// "properties",
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

