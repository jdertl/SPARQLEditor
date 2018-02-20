### TODO:
* Create custom autocomplete that loads user defined properties for classes, able to traverse page to find assigned class
* Function to extract all triple statements
* Catch errors from autocompletes
	* Possibly introduce "finalized" flag to autocompleters to allow bypass to error catch for debugging


### COMPLETED:
* Support for multiple suggestion list recommendations without conflicting
* Allow for replacement of suggestions with replacements that differ from displayed text
	* Previous usage: "autocompleter.get()" returned ["inserted1", "inserted2", ...]
	* New usage: "autocompleter.get()" can return ["inserted1", ["displayed2", "inserted2"], ...]