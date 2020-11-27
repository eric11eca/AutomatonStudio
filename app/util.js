let util = {};

util.Stack = function (capacity) {
	this._capacity = capacity || Infinity;
	this._storage = {};
	this.count = 0;
};

util.Stack.prototype.push = function (val) {
	if (this._count < this._capacity) {
		this._storage[this._count + 1] = val;
		this._count += 1;
		return this._count;
	}
	return 'Max capacity already reached. Remove element before adding a new one.';
};

util.Stack.prototype.pop = function () {
	var value = this._storage[this._count - 1];
	this._count -= 1;
	delete this._storage[this._count];
	if (this._count < 0) {
		this._count = 0;
	}
	return value;
};

util.Stack.prototype.peek = function () {
	return this._storaget[this._count - 1];
};

util.Stack.prototype.size = function (val) {
	return this._count;
};

util.areEquivalent = function (object1, object2) {
	if (object1 === object2) {
		return true;
	}

	if (object1 instanceof Set && object2 instanceof Set){
		for(var itemInSet1 of object1){
			if(!util.containsInSet(object2, itemInSet1)){
				return false;
			}
		}
		for(var itemInSet2 of object2){
			if(!util.containsInSet(object1, itemInSet2)){
				return false;
			}
		}
		return true;
	}

	if (object1 instanceof Date && object2 instanceof Date) {
		return object1.getTime() === object2.getTime();
	}

	if (object1 instanceof RegExp && object2 instanceof RegExp) {
		return object1.source === object2.source &&
			object1.global === object2.global &&
			object1.multiline === object2.multiline &&
			object1.lastIndex === object2.lastIndex &&
			object1.ignoreCase === object2.ignoreCase;
	}

	if (!(object1 instanceof Object) || !(object2 instanceof Object)) {
		return false;
	}

	if (typeof object1 === 'undefined' || typeof object2 === 'undefined') {
		return false;
	}

	if (object1.constructor !== object2.constructor) {
		return false;
	}

	for (var p in object1) {
		if (!(p in object2)) {
			return false;
		}

		if (object1[p] === object2[p]) {
			continue;
		}

		if (typeof (object1[p]) !== "object") {
			return false;
		}

		if (!(util.areEquivalent(object1[p], object2[p]))) {
			return false;
		}
	}

	for (p in object2) {
		if (!(p in object1)) {
			return false;
		}
	}
	return true;
};

util.containsInSet = function (set1, obj) {
	for (var itemInSet of set1) {
		if (util.areEquivalent(itemInSet, obj)) {
			return true;
		}
	}
	return false;
};

// check if array arr contains obj starting from index startIndex
util.contains = function (arr, obj, startIndex) {
	startIndex = startIndex ? startIndex : 0;

	for (var i = startIndex; i < arr.length; i++) {
		if (Array.isArray(arr[i])) {
			arr[i].sort();
		}
		if (Array.isArray(obj)) {
			obj.sort();
		}
		if (util.areEquivalent(arr[i], obj)) {
			return true;
		}
		if (Array.isArray(arr[i]) && Array.isArray(obj)) {
			if (JSON.stringify(arr[i]) == JSON.stringify(obj)) {
				return true;
			}
		}
	}

	return false;
};

// returns the index of the leftmost obj instance in arr starting from startIndex or -1
// if no instance of obj is found
util.index = function (arr, obj, startIndex) {
	var i = startIndex || 0;
	while (i < arr.length) {
		if (util.areEquivalent(arr[i], obj)) {
			return i;
		}
		i++;
	}
	return -1;
};

// check if array arr1 contains all elements from array arr2
util.containsAll = function (arr1, arr2) {
	for (var i = 0; i < arr2.length; i++) {
		if (!(util.contains(arr1, arr2[i]))) {
			return false;
		}
	}
	return true;
};

// check if array arr1 contains any element from array arr2
util.containsAny = function (arr1, arr2) {
	for (var i = 0; i < arr2.length; i++) {
		if (util.contains(arr1, arr2[i])) {
			return true;
		}
	}
	return false;
};

// check if arrays arr1 and arr2 contain the same elements
util.areEqualSets = function (arr1, arr2) {
	if (arr1.length !== arr2.length) {
		return false;
	}

	for (var i = 0; i < arr1.length; i++) {
		if (!(util.contains(arr2, arr1[i]))) {
			return false;
		}
	}

	return true;
};

// check if array arr1 contains the set obj
util.containsSet = function (arr1, obj) {
	for (var i = 0; i < arr1.length; i++) {
		if (util.areEqualSets(arr1[i], obj)) {
			return true;
		}
	}
	return false;
};


util.flat = function(set){
	var result = new Set();
	util.flat_operating(set, result);
	return result;
}

util.flat_operating = function(set, resultSet){
	for(var itemInSet1 of set){
		if(itemInSet1 instanceof Set){
			util.flat_operating(itemInSet1, resultSet);
		}else{
			resultSet.add(set);
		}
	}
}

util.returnEqualSet = function (arr, obj) {
	for (var i = 0; i < arr.length; i++) {
		if (util.areEqualSets(arr[i], obj)) {
			return arr[i];
		}
	}
	return [];
};

util.Union = function (a, b) {
	var arr1 = Array.from(a);
	var arr2 = Array.from(b);
	return new Set(arr1.concat(arr2));
};

util.Intersection = function (a, b) {
	return new Set([...a].filter(x => {
		if (Array.isArray(x)) {
			return util.contains(Array.from(b), x);
		} else {
			return b.has(x);
		}
	}));
};

util.Difference = function (a, b) {
	return new Set([...a].filter(x => {
		if (Array.isArray(x)) {
			return !(util.contains(Array.from(b), x));
		} else {
			return !(b.has(x));
		}
	}));
};

util.Equal = function (a, b) {
	return a.size === b.size && [...a].every(value => b.has(value));
};

// returns an unsorted array representation of the union of the two arrays arr1 and arr2
// with each element included exactly once, regardless of the count in arr1 and arr2
util.setUnion = function (arr1, arr2) {
	var res = [];
	var i;
	for (i = 0; i < arr1.length; i++) {
		// this will not include duplicates from arr1
		if (!util.contains(res, arr1[i])) {
			res.push(arr1[i]);
		}
	}
	for (i = 0; i < arr2.length; i++) {
		if (!util.contains(res, arr2[i])) {
			res.push(arr2[i]);
		}
	}
	return res;
};

// returns an unsorted array representation of the intersection of the two
// arrays arr1 and arr2 with each element included exactly once, regardless
// of the count in arr1 and arr2
util.setIntersection = function (arr1, arr2) {
	var res = [];
	var i;
	for (i = 0; i < arr1.length; i++) {
		if (util.contains(arr2, arr1[i])) {
			res.push(arr1[i]);
		}
	}
	return res;
};

// make a deep clone of an object
util.clone = function (obj) {
	return JSON.parse(JSON.stringify(obj));
};


// Returns an object that is basically an integer reference useful for counting
// across multiple function calls. The current value can be accessed through the
// value property.
// See the re.tree.toAutomaton function for a usage example.
util.makeCounter = (function () {
	function getAndAdvance() {
		return this.value++;
	}

	function makeCounter(init) {
		return {
			value: init,
			getAndAdvance: getAndAdvance
		};
	}

	return makeCounter;
})();


// Returns a random integer from the interval [from, to].
util.randint = function (from, to) {
	return Math.floor(Math.random() * (to - from + 1)) + from;
};

util.printJson = function (expression) {
	console.log(JSON.stringify(expression, null, 2));
};

exports.data = util;