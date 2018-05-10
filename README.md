General Usage:
	> Making a Custom Autocompleter Using Triple “Get” Functions:
		- Inside of registered autocompleter, change the “get” entry to:
			get: {
				getSubject: function( ... ){ ... },		(or String Array)
				getPredicate: function( ... ){ ... },	(or String Array)
				getObject: function( ... ){ ... }		(or String Array)
			}
		- Each function’s parameters are in the following order:
			+ context		(Object)
			+ subjectClass	(String or undefined)
			+ subject		(String or undefined)
			+ predicate		(String or undefined)
			+ object		(String or undefined)
			+ token			(Object)
			+ callback		(Function)
		- Operates exactly as normal YASQE “get” Function / Array, with matching return values, “token”, and “callback”

	> Using Partial Match Filter:
		- Assigned at “yasqe.autocompleters.partialMatchFilter(list, token)”
			+ list  (Array or Object)
				: Array of strings that should be checked
				: Object with keys only as strings that should be checked
			+ token  (String or undefined)
				: String to search for inside of “list”
				: Undefined will default to returning all values
			+ Returns an array of strings that match entries for “list” based on any matches to “token” without case sensitivity

	> Simple Local Definitions:
		- Provides a simple dictionary style lookup for triple statements
			+ yasqe.autocompleters.addLocalDefinition(subject, predicate, object)
				: subject, predicate, object  (Strings or undefined)

				: addLocalDefinition(“<my_subject>”)
					Adds only “<my_subject>” to suggestions for class and subject sections
				: addLocalDefinition(“<my_subject>”, “<my_predicate>”, “\”My Object\””)
					Adds subject, predicate, and object to corresponding sections
				: addLocalDefinition(null, “<my_predicate>”)
					Currently illegal as subject has to be a String

			+ yasqe.autocompleters.removeLocalDefinition(subject, predicate, object)
				: subject, predicate, object  (Strings or undefined)

				: removeLocalDefinition(“<my_subject>”)
					Removes the “<my_subject>” class and ALL children
				: removeLocalDefinition(“<my_subject>”, “<my_predicate>”, “\”My Object\””)
					Removes the “My Object” object from the “<my_subject>” “<my_predicate>” chain of Strings
				: removeLocalDefinition(null, “<my_predicate>”)
					Currently illegal as subject has to be a String