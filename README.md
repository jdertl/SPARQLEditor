### TODO:
* Catch errors from autocompletes
	* Possibly introduce "finalized" flag to autocompleters to allow bypass to error catch for debugging


### COMPLETED:
* Support for multiple suggestion list recommendations without conflicting
* Allow for replacement of suggestions with replacements that differ from displayed text
	* Previous usage: `autocompleter.get(...)` returned ["inserted1", "inserted2", ...]
	* New usage: `autocompleter.get(...)` can return ["inserted1", ["displayed2", "inserted2"], ...]
* Function to extract all triple statements
	* `yasqe.getTriples(forSuggestion, useBuffer) -> {data = [["token1", "token2", ...], ...], cursor = [lineNumber, entryNumber]} or null`
		* `forSuggestion` : True if the returned information is intended for an autocompleter.  Allows for returning null to short circuit if the cursor is in a bad suggestion location.  Returns null if the cursor is outside of a triples block or query is improper.
		* `useBuffer` : True to return the last created triples object to reduce load.
		* `data` : Array of arrays that contain (if formatted correctly) the triples block query.  If the cursor is in a position that is whitespace or partial characters, it is inserted even if it breaks triple format.  Keywords such as "filter" are not destroyed but instead inserted based on tokenization of YASQE.  Triple format is not enforced in order to allow incomplete lines.
		* `cursor` : `data[lineNumber][entryNumber]` would correspond to the token that the cursor was found at.  **Note:**  `lineNumber` may "move" in certain situations, such as at the end of a line after a puncuation (".", ";") where the cursor would physically be on line x, but would technically be on line x + 1 as it would now be in the entries after the puncuation.  `entryNumber` may also be negative, which would correspond to the cursor being in whitespace before a line's existing triple statements.
* `autocompleter.getUsesCompleteToken` can be set to "true" on `YASQE.registerAutocompleter(...)` initialization table to enable overriding of token parameter passed to `autocompleter.get(...)`, allows for full token data instead of only token string
* Modify previous token search to use character number
	* Previous: `yasqe.getPreviousNonWsToken(yasqe, line, token)` only allowed `token` to be full token data
	* New: `yasqe.getPreviousNonWsToken(yasqe, line, token_char)` allows for previous usage or using a character number to designate position
* Example autocomplete using `yasqe.getTriples(...)` to suggest custom subject, predicate, and object data