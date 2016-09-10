function makeRoom (match) { return ' '+match }
function movePunctuation (str) { return str.replace(/[,:;()]/g, makeRoom) }

// repeat returns an array of the elem repeated times times.
function repeat(elem, times) {
    var ret = [ elem ]
    for(var i = 1; i < times; i++) ret.push( elem )
    return ret
}

// updNGramEntry increases the probability of tokens[0] by addProb and passes the rest of the tokens
// array (if tokens.slice(1).length > 0) to the recursive calls of updNGramEntry, moving in the
// requested direction. Thus this function increases the probability of the main entry and frequen-
// cies of its descendants (which should be normalized later to obtain the actual probabilities).
// The tokens.length of the initial call should be equal n in your n-gram table.
function updNGramEntry (entry, tokens, direction, addProb) {
    entry.prob += addProb

    // Regardless of the requested addProb, pass down 1.0, indicating that downstream probabilities
    // have to be normalized later (for them we can't figure out the number of samples just yet).
    if (tokens.length > 1) {
        if (! entry[direction].hasOwnProperty(tokens[1]))
            entry[direction][tokens[1]] = new NGramNode
        updNGramEntry(entry[direction][tokens[1]], tokens.slice(1), direction, 1.0)
    }
}

// normalizeNGramEntry normalizes probabilities of the entry's descendants in the requested
// direction, and invokes normalizeNGramEntry function for each of them.
function normalizeNGramEntry (entry, direction) {
    var nextTotal = 0.0
    for (var k in entry[direction])
        nextTotal += entry[direction][k].prob
    for (var k in entry[direction]) {
        entry[direction][k].prob /= nextTotal
        normalizeNGramEntry(entry[direction][k], direction)
    }
}

function NGramNode(form) {
    // Our probability of being in this state, given the previous state.
    this.prob = 0.0

    // From each of the core nodes in a n-gram model we have paths of n-1 next/previous states. In
    // the end states these variables should remain empty objects.
    this.forw = {} // possible next states (i.e. words)
    this.backw = {} // possible previous states (i.e. words)
}

// nGrams return an object, where the labels are tokens which can be found in the textStr. To each
// token the function assigns a chain of NGramNode objects of length n (including the main node),
// leading forward and backward. The ?, !. . characters are treated as sentence delimeters and remo-
// ved. At the sentence boundaries the function inserts dummy . entries to make sure that n-length
// rule is preserved.
function nGrams (textStr, n) {
    var ngrams = Object()

    // replace !s and ?s with dots, then split by dots
    var sents = textStr.replace(/[!?]/g, '.').split('.')
    var sent_tokens = [] // list of tokens for each sentence

    var wordTotal = 0
    for (var s in sents) {
        sent_tokens[s] = movePunctuation(sents[s]).split(' ')

        wordTotal += sent_tokens[s].length

        // Ensure that each wprd has its NGramNode entry.
        for (var w in sent_tokens[s])
            if (! ngrams.hasOwnProperty(sent_tokens[s][w]))
                ngrams[sent_tokens[s][w]] = new NGramNode()
    }

    // This is a probability unit that each word will receive for its one occurrence.
    var probUnit =  1.0 / wordTotal

    // Build the ngram chains from words of each sentence.
    for (var s in sent_tokens) {
        // Add dots at the sentence boundaries, so they will have some representation in our ngrams.
        // (note that we already removed the actual in-text dots)
        var tokens = repeat('.', n-1) .concat(sent_tokens[s], repeat('.', n-1))

        for (var i = n-1; i < tokens.length-(n-1); i++)
            updNGramEntry(ngrams[tokens[i]], tokens.slice(i, i+n), 'forw', probUnit)
        for (var i = tokens.length-n; i >= n-1; i--)
            // Here we don't want to increase the probability, since we've already made it above.
            updNGramEntry(ngrams[tokens[i]], tokens.slice(i-n+1, i+1).reverse(), 'backw', 0.0)
    }

    // Normalize the probabilities of the embedded paths.
    for (var k in ngrams) {
        normalizeNGramEntry(ngrams[k], 'forw')
        normalizeNGramEntry(ngrams[k], 'backw')
    }

    return ngrams
}
