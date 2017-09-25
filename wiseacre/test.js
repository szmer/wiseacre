function testFunc (func, tests) {
    console.log('Testing '+func.name+' ('+tests.length+' cases):')
    var pass = true

    for(t in tests)
        if(! eval(tests[t])) {
            console.log('Failed: '+tests[t])
            pass = false
        }

    if(pass)
        console.log('PASS')
    else
        console.log('FAIL')
    return pass
}

function tests () {
    console.log('Running tests for Chatter.')

    testFunc(repeat, [
        "var l = repeat('bcd', 3); l.join('') == 'bcdbcdbcd'"
    ])
    testFunc(makeRoom, [
        "makeRoom('tty') == ' tty'",
        "makeRoom(' tele fax') == '  tele fax'"
    ])
    testFunc(movePunctuation, [
        "movePunctuation(', abba, cdda;') == ' , abba , cdda ;'",
        "movePunctuation(',,, zyxyxy: yeah') == ' , , , zyxyxy : yeah'",
        "movePunctuation('... zyxyxy? yeah!') == ' . . . zyxyxy ? yeah !'"
    ])
    testFunc(updNGramEntry, [
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); 'bb' in o.forw",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); ! ('aa' in o.forw)",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); o.prob == 0.1",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); o.forw['bb'].prob == 1.0",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); o.backw['bb'].backw['cc'].prob == 1.0",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); updNGramEntry(o, ['aa', 'bb'], 'forw', 0.1); o.prob == 0.2",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); o.backw['bb'].backw['cc'].prob == 2.0",
    ])
    testFunc(normalizeNGramNode, [
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); updNGramEntry(o, ['aa', 'bb', 'dd'], 'backw', 0.1); normalizeNGramNode(o.backw); o.backw['bb'].backw['cc'].prob == 0.5 && o.backw['bb'].backw['dd'].prob == 0.5",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); updNGramEntry(o, ['aa', 'bb', 'dd'], 'backw', 0.1); normalizeNGramNode(o.backw); o.backw['bb'].prob == 1.0",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); updNGramEntry(o, ['aa', 'cc', 'dd'], 'backw', 0.1); normalizeNGramNode(o.backw); o.backw['bb'].prob == 0.5 && o.backw['bb'].backw['cc'].prob == 1.0",
        "var o = new NGramNode('aa'); updNGramEntry(o, ['aa', 'bb', 'cc'], 'backw', 0.1); updNGramEntry(o, ['aa', 'bb', 'dd'], 'backw', 0.1); normalizeNGramNode(o.backw); o.prob == 0.2",
    ])
    testFunc(nGrams, [
        "var o = new nGrams('zyxyxy telefax angh cdda', 3); (o['zyxyxy'].prob == 0.25)",
        "var o = new nGrams('zyxyxy telefax angh cdda', 3); (o['zyxyxy'].prob == o['cdda'].prob)",
        "var o = new nGrams('zyxyxy telefax angh cdda zyxyxy telefax angh', 3); (o['zyxyxy'].prob == 2/7 && o['cdda'].prob == 1/7)",
        "'farther nodes'; var o = new nGrams('zyxyxy telefax angh cdda zyxyxy telefax tty', 3); (o['zyxyxy'].forw['telefax'].forw['angh'].prob == 0.5 && o['zyxyxy'].forw['telefax'].forw['tty'].prob == 0.5)",
        "'backward nodes'; var o = new nGrams('zyxyxy telefax angh cdda zyxyxy telefax tty', 3); (o['angh'].backw['telefax'].backw['zyxyxy'].prob == 1.0)",
        "'punctuation'; var o = new nGrams('zyxyxy telefax angh; cdda: zyxyxy telefax angh;', 3); (o['telefax'].forw['angh'].forw[';'].prob == 1.0 && o[';'].forw['cdda'].forw[':'].prob == 1.0)",
        "'dot/boundary nodes'; var o = new nGrams('zyxyxy telefax angh cdda zyxyxy telefax tty', 3); (o['telefax'].backw['zyxyxy'].backw['cdda'].prob == 0.5 && o['telefax'].backw['zyxyxy'].backw['.'].prob == 0.5)",
        "'multiple sentences'; var o = new nGrams('zyxyxy telefax. angh cdda! zyxyxy telefax angh.', 3); (o['zyxyxy'].forw['telefax'].forw['.'].prob == 0.5 && o['angh'].forw['cdda'].forw['.'].prob == 1.0)",
        "'n == 5'; var o = new nGrams('zyxyxy telefax. angh cdda! zyxyxy telefax angh.', 5); (o['cdda'].forw['.'].forw['.'].forw['.'].forw['.'].prob == 1.0)"
    ])
    testFunc(cleanSentence, [
        "cleanSentence('raging cockatrices') == 'Raging cockatrices'",
        "cleanSentence('Evil mind flayers') == 'Evil mind flayers'",
        "cleanSentence(',,: deadly soldier ants') == 'Deadly soldier ants'",
        "cleanSentence(':,, ! :') == '!'"
    ])
}
// Run them automatically:
tests()
