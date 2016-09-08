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

    testFunc(repeatStr,
            ["repeatStr('bcd', 3) == 'bcdbcdbcd'"])
    testFunc(makeRoom,
             ["makeRoom('tty') == ' tty'",
              "makeRoom(' tele fax') == '  tele fax'"])
    testFunc(movePunctuation,
             ["movePunctuation(', abba, cdda!') == ' , abba , cdda !'",
              "movePunctuation(',,, zyxyxy: yeah') == ' , , , zyxyxy : yeah'"])
    testFunc(updFreqEntry,
             ["var o = Object(); updFreqEntry(o, 'aa'); o['aa'] == 1",
              "var o = Object(); updFreqEntry(o, 'aa'); updFreqEntry(o, 'aa'); o['aa'] == 2"])
    testFunc(nGramFreqs,
             [
                 "var o = nGramFreqs('zyxyxy telefax angh cdda', 3); (o['zyxyxy telefax angh'] == o['telefax angh cdda'] == 1)",
                 "var o = nGramFreqs('zyxyxy telefax angh cdda zyxyxy telefax angh', 3); (o['zyxyxy telefax angh'] == 2 && o['angh cdda zyxyxy'] == o['telefax angh cdda'] == 1)",
                 // punctuation:
                 "var o = nGramFreqs('zyxyxy telefax angh; cdda: zyxyxy telefax angh;', 3); (o['telefax angh ;'] == 2 && o['; cdda :'] == o['cdda : zyxyxy'] == 1)",
                 // dummy n-grams:
                 "var o = nGramFreqs('zyxyxy telefax angh cdda zyxyxy telefax angh', 3); (o['telefax angh .'] == o['angh . .'] == 1)",
                 // multiple sentences:
                 "var o = nGramFreqs('zyxyxy telefax. angh cdda! zyxyxy telefax angh.', 3); (o['zyxyxy telefax .'] == undefined && o['angh cdda .'] == o['telefax angh .'] == 1)",
                 // for some n's /= 3
                 "var o = nGramFreqs('zyxyxy telefax angh cdda', 1); (o['zyxyxy'] == o['angh'] == 1)",
                 "var o = nGramFreqs('zyxyxy telefax angh cdda', 2); (o['zyxyxy telefax'] == o['angh cdda'] == 1)",
                 "var o = nGramFreqs('zyxyxy telefax angh cdda', 5); (o['zyxyxy telefax angh cdda .'] == o['cdda . . . .'] == 1)",
             ])
}
// Run them automatically:
tests()
